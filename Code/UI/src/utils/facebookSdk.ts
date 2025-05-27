// export const initializeFacebookSDK = () => {
//     return new Promise<void>((resolve) => {
//       window.fbAsyncInit = () => {
//         window.FB.init({
//             appId            : '590306753515087',
//             autoLogAppEvents : true,
//             xfbml            : true,
//             version          : 'v22.0'
//           });
//         resolve();
//       };
  
//       // Load the SDK asynchronously
//       if (document.getElementById('facebook-jssdk')) {
//         return;
//       }
//       const script = document.createElement('script');
//       script.id = 'facebook-jssdk';
//       script.src = 'https://connect.facebook.net/en_US/sdk.js#version=v2.2&appId=myAppId&xfbml=true&autoLogAppEvents=true';
//       document.body.appendChild(script);
//     });
//   };

export const initializeFacebookSDK = () => {
  window.fbAsyncInit = function () {
    window.FB.init({
      appId: '590306753515087', // Your Facebook App ID
      autoLogAppEvents: true,
      xfbml: true,
      version: 'v22.0', // Ensure this version is valid
    });
    console.log('Facebook SDK initialized.');
  };

  // Load the SDK asynchronously
  (function (d, s, id) {
    let js: HTMLScriptElement | null,
      fjs = d.getElementsByTagName(s)[0] as HTMLScriptElement;
    if (d.getElementById(id)) return;
    js = d.createElement(s) as HTMLScriptElement;
    js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    fjs.parentNode?.insertBefore(js, fjs);
  })(document, 'script', 'facebook-jssdk');
};