import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateUsername,
  validatePassword,
  getPasswordStrength,
} from '@/utils/validation';

describe('validateEmail', () => {
  it('空字符串应返回无效提示', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('请输入邮箱地址');
  });

  it('缺少 @ 的字符串应返回格式不正确', () => {
    const result = validateEmail('example.com');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('邮箱格式不正确');
  });

  it('缺少域名的字符串应返回格式不正确', () => {
    const result = validateEmail('user@');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('邮箱格式不正确');
  });

  it('合法的邮箱应返回有效', () => {
    const result = validateEmail('user@example.com');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  it('带子域名的邮箱应返回有效', () => {
    const result = validateEmail('john.doe@mail.example.com');
    expect(result.valid).toBe(true);
  });
});

describe('validateUsername', () => {
  it('空字符串应返回无效提示', () => {
    const result = validateUsername('');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('请输入用户名');
  });

  it('长度为 1 的字符串应返回长度提示', () => {
    const result = validateUsername('a');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('用户名长度应在 2-50 个字符之间');
  });

  it('长度超过 50 的字符串应返回长度提示', () => {
    const result = validateUsername('a'.repeat(51));
    expect(result.valid).toBe(false);
    expect(result.message).toBe('用户名长度应在 2-50 个字符之间');
  });

  it('包含非法字符的字符串应返回字符提示', () => {
    const result = validateUsername('user name!');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('用户名只能包含字母、数字、下划线和中文');
  });

  it('合法字母数字用户名应返回有效', () => {
    const result = validateUsername('User_123');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  it('合法中文用户名应返回有效', () => {
    const result = validateUsername('测试用户');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });
});

describe('validatePassword', () => {
  it('空字符串应返回无效提示', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('请输入密码');
  });

  it('长度小于 6 的字符串应返回长度提示', () => {
    const result = validatePassword('12345');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密码长度至少为 6 位');
  });

  it('长度超过 100 的字符串应返回长度提示', () => {
    const result = validatePassword('a'.repeat(101));
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密码长度不能超过 100 位');
  });

  it('合法密码应返回有效', () => {
    const result = validatePassword('Valid123!');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });
});

describe('getPasswordStrength', () => {
  it('空字符串应返回 level 0', () => {
    const result = getPasswordStrength('');
    expect(result.level).toBe(0);
    expect(result.text).toBe('');
    expect(result.color).toBe('');
  });

  it('仅数字且长度 < 8 的密码应返回弱', () => {
    const result = getPasswordStrength('123456');
    expect(result.level).toBe(1);
    expect(result.text).toBe('弱');
    expect(result.color).toBe('bg-red-500');
  });

  it('包含大小写字母和数字但长度 < 8 的密码应返回中等', () => {
    const result = getPasswordStrength('AbcdeF1');
    expect(result.level).toBe(2);
    expect(result.text).toBe('中');
    expect(result.color).toBe('bg-yellow-500');
  });

  it('包含大小写字母、数字和符号的密码应返回强', () => {
    const result = getPasswordStrength('Abcdefgh123!');
    expect(result.level).toBe(3);
    expect(result.text).toBe('强');
    expect(result.color).toBe('bg-green-500');
  });
});
