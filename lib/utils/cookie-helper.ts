import Cookies from 'js-cookie';

export const getCookieOptions = () => {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const options: any = { expires: 7, path: '/' };
  if (isHttps) {
    options.secure = true;
    options.sameSite = 'strict';
  }
  return options;
};

export const setAuthCookies = (accessToken: string, refreshToken: string, user: any) => {
  const options = getCookieOptions();
  Cookies.set('accessToken', accessToken, options);
  Cookies.set('refreshToken', refreshToken, options);
  Cookies.set('user', JSON.stringify(user), options);
  console.log('✅ Cookies set:', { secure: options.secure || false });
};
