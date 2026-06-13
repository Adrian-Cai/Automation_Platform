import { afterEach, describe, expect, it, vi } from 'vitest';

import { normalizeConfiguredJenkinsBaseUrl } from '../../../server/utils/jenkinsUrl';
import { isMisconfiguredTestRepoUrl } from '../../../server/utils/jenkinsRepoValidation';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('normalizeConfiguredJenkinsBaseUrl', () => {
  it('normalizes the legacy jenkins.wiac.xyz:8080 endpoint to the https entrypoint', () => {
    expect(normalizeConfiguredJenkinsBaseUrl('http://jenkins.wiac.xyz:8080/')).toBe(
      'https://jenkins.wiac.xyz'
    );
  });

  it('normalizes the legacy www.wiac.xyz:8080 alias to the https Jenkins hostname', () => {
    expect(normalizeConfiguredJenkinsBaseUrl('http://www.wiac.xyz:8080')).toBe(
      'https://jenkins.wiac.xyz'
    );
  });

  it('leaves already-correct Jenkins URLs unchanged', () => {
    expect(normalizeConfiguredJenkinsBaseUrl('https://jenkins.wiac.xyz/')).toBe(
      'https://jenkins.wiac.xyz'
    );
  });
});

describe('isMisconfiguredTestRepoUrl', () => {
  it('returns true when test repo url points to the automation platform repository', () => {
    expect(isMisconfiguredTestRepoUrl(
      'https://cnb.cool/ImAcaiy/Automation_Platform.git',
      'https://cnb.cool/ImAcaiy/Automation_Platform'
    )).toBe(true);
  });

  it('returns false when test repo url points to a different repository', () => {
    expect(isMisconfiguredTestRepoUrl(
      'https://cnb.cool/ImAcaiy/SeleniumBase-CI.git',
      'https://cnb.cool/ImAcaiy/Automation_Platform'
    )).toBe(false);
  });

  it('returns false when one side is missing', () => {
    expect(isMisconfiguredTestRepoUrl(undefined, 'https://cnb.cool/ImAcaiy/Automation_Platform')).toBe(false);
    expect(isMisconfiguredTestRepoUrl('https://cnb.cool/ImAcaiy/SeleniumBase-CI', undefined)).toBe(false);
  });
});

describe('JenkinsService trigger parameters', () => {
  it('passes the Jenkins API key to batch jobs so the runner can mark execution start', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      JENKINS_TOKEN: 'jenkins-token',
      JENKINS_API_KEY: 'platform-api-key',
      JENKINS_URL: 'https://jenkins.example.com',
      JENKINS_JOB_API: 'api-job',
      JENKINS_TEST_REPO_URL: 'https://cnb.cool/ImAcaiy/SeleniumBase-CI.git',
      JENKINS_TEST_REPO_BRANCH: 'master',
    };

    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const requestUrl = String(url);
      if (requestUrl.includes('/crumbIssuer/api/json')) {
        return new Response(JSON.stringify({ crumbRequestField: 'Jenkins-Crumb', crumb: 'crumb' }), { status: 200 });
      }

      return new Response('', {
        status: 201,
        headers: { Location: 'https://jenkins.example.com/queue/item/123/' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { JenkinsService } = await import('../../../server/services/JenkinsService');
    const service = new JenkinsService();

    const result = await service.triggerBatchJob(
      6752,
      [1, 2],
      [
        'examples/D/test_console_logging.py::TestConsoleLogging::test_console_logging',
        'examples/B/test_scrape_bing.py::ScrapeBingTests::test_scrape_bing',
      ],
      'https://autotest.wiac.xyz/api/jenkins/callback'
    );

    expect(result.success).toBe(true);

    const triggerCall = fetchMock.mock.calls.find(([url]) => String(url).includes('/job/api-job/buildWithParameters'));
    expect(triggerCall).toBeDefined();

    const triggerBody = triggerCall?.[1] instanceof Object && 'body' in triggerCall[1]
      ? triggerCall[1].body
      : undefined;
    expect(triggerBody).toBeInstanceOf(URLSearchParams);
    expect((triggerBody as URLSearchParams).get('JENKINS_API_KEY')).toBe('platform-api-key');
  });
});
