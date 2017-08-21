(function() {
  'use strict';

  const applicationServerPublicKey =
    'BNrl34blyO1PI41HcBpgHqfsLS5CvdrraJTb0YmuGbHU5GRQ' +
    'idRTsxWalC-5HJ3BuvDNk4O7DVzwtMuURvw7N-k';

  const pushButton = document.querySelector('.push-switch');
  const pushButtonText = document.querySelector('.mdl-switch__label');
  const chooseTimeBtn = document.querySelector('#chooseTimeBtn');
  const time = document.querySelector('#time');

  var isSubscribed = false;
  var swRegistration = null;
  var snackBarContainer = document.getElementById('mdl-js-snackbar');

  /**
   * Add one string.
   * @param {string} base64String string to convert
   * @return {array} array
   */
  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('service-worker.js')
      .then(function(swReg) {
        console.log('Service Worker is registered', swReg);

        swRegistration = swReg;
        initialiseUI();
      })
      .catch(function(error) {
        console.error('Service Worker Error', error);
      });
  } else {
    console.warn('Push messaging is not supported');
    chooseTimeBtn.disabled = true;
    pushButton.disabled = true;
    time.disabled = true;
    pushButtonText.textContent = 'Пуш-уведомления не ' +
      'поддерживаются вашим браузером';
  }

  /**
   * Add no string.
   *
   */
  function initialiseUI() {
    pushButton.addEventListener('click', function() {
      // pushButton.disabled = true;
      if (isSubscribed) {
        unsubscribeUser();
      } else {
        subscribeUser();
      }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
      .then(function(subscription) {
        isSubscribed = !(subscription === null);

        updateSubscriptionOnServer(subscription);

        if (isSubscribed) {
          // console.log('User IS subscribed.');
        } else {
          // console.log('User is NOT subscribed.');
        }

        updateBtn();
      });
  }

  /**
   * Add no string.
   *
   */
  function updateBtn() {
    if (Notification.permission === 'denied') {
      pushButtonText.textContent = 'Пуш-уведомления заблокированы.';
      pushButton.disabled = true;
      updateSubscriptionOnServer(null);
      return;
    }

    if (isSubscribed) {
      pushButton.classList.remove('is-checked');
      pushButton.checked = true;
      pushButtonText.textContent = 'Отключить пуш-уведомления';
    } else {
      pushButton.classList.add('is-checked');
      pushButtonText.textContent = 'Включить пуш-уведомления';
    }

    // pushButton.disabled = false;
  }

  /**
   * Add no string.
   *
   */
  function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
      .then(function(subscription) {
        const title = 'Отлично';
        const options = {
          body: 'Теперь вы будете получать уведомления.',
          icon: '/images/logo128.png'
        };
        swRegistration.showNotification(title, options);
        // console.log('User is subscribed.');
        updateSubscriptionOnServer(subscription);
        isSubscribed = true;

        updateBtn();
      })
      .catch(function(err) {
        console.log('Failed to subscribe the user: ', err);
        updateBtn();
      });
  }

  /**
   * Add no string.
   *
   */
  function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
      .then(function(subscription) {
        if (subscription) {
          return subscription.unsubscribe();
        }
      })
      .catch(function(error) {
        console.log('Error unsubscribing', error);
      })
      .then(function() {
        updateSubscriptionOnServer(null);

        console.log('User is unsubscribed.');
        isSubscribed = false;

        updateBtn();
      });
  }

  /**
   * Add one string.
   * @param {string} subscription is subscription
   */
  function updateSubscriptionOnServer(subscription) {
    // const subscriptionJson = document.querySelector('.js-subscription-json');
    // const subscriptionDetails =
    document.querySelector('.js-subscription-details');

    if (subscription) {
      // subscriptionJson.textContent = JSON.stringify(subscription);
      // subscriptionDetails.classList.remove('is-invisible');
    } else {
      // subscriptionDetails.classList.add('is-invisible');
    }
  }

  window.addEventListener('load', function() {
    var userProfile = localStorage.getItem('userProfile');
    var webAuth = new auth0.WebAuth({
      domain: 'readbible.eu.auth0.com',
      clientID: 'JO3y2bQRDZkLP4vvBFifIPDNpszgSfCI',
      redirectUri: window.location.href,
      audience: 'https://readbible.eu.auth0.com/userinfo',
      responseType: 'token id_token',
      scope: 'openid profile'
    });

    var text;

    var loginBtn = document.getElementById('btn-login');
    var logoutBtn = document.getElementById('btn-logout');

    var features = document.getElementById('features');
    var overview = document.getElementById('overview');
    var profivarab = document.getElementById('profile');

    var profileTab = document.getElementById('profileTab');
    var featuresTab = document.getElementById('featuresTab');
    var overviewTab = document.getElementById('overviewTab');


    var choosenTime = document.getElementById('choosenTime');
    if (localStorage.getItem('rememberTime') && isSubscribed === true) {
      choosenTime.innerHTML = 'Вы установили напоминание на: ' +
        localStorage.getItem('rememberTime');
    } else if (localStorage.getItem('rememberTime') &&
      isSubscribed === false) {
      choosenTime.innerHTML = 'Вам нужно разрешить показ уведомлений.';
    }

    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      webAuth.authorize();
    });

    /**
     * Add one string.
     * @param {string} authResult result
     */
    function setSession(authResult) {
      // Set the time that the access token will expire at
      var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
      );
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);
    }

    /**
     * Add no string.
     *
     */
    function logout() {
      // Remove tokens and expiry time from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('rememberTime');
      displayButtons();
      location.reload();
    }

    logoutBtn.addEventListener('click', function() {
      logout();
    });

    /**
     * Add no string.
     * @return {date} date
     */
    function isAuthenticated() {
      // Check whether the current time is past the
      // access token's expiry time
      var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      return new Date().getTime() < expiresAt;
    }

    /**
     * Add no string.
     *
     */
    function displayButtons() {
      if (isAuthenticated()) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        profivarab.style.display = 'inline-block';
        getProfile();
        // profivarab.className += ' is-active';
        // features.className.replace(' is-active', '');
        // overview.className.replace(' is-active', '');
        //
        // profileTab.className += ' is-active';
        // featuresTab.className.replace(' is-active', '');
        // overviewTab.className.replace(' is-active', '');
      } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        profivarab.style.display = 'none';
      }
    }

    /**
     * Add no string.
     *
     */
    function handleAuthentication() {
      webAuth.parseHash(function(err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {
          window.location.hash = '';
          setSession(authResult);
          loginBtn.style.display = 'none';
          initialiseUI();
          getProfile();
        } else if (err) {
          // alert(
          //   'Error: ' + err.error + '. Check the console for further details.'
          // );
        }
        displayButtons();
      });
    }
    handleAuthentication();

    /**
     * No parametrs
     * @return {date} date
     */
    function getTime() {
      var date = new Date();
      var hours = date.getHours() < 10 ? '0' +
      date.getHours() : date.getHours();
      var minutes = date.getMinutes() < 10 ? '0' +
      date.getMinutes() : date.getMinutes();
      var time = hours + ':' + minutes;
      return time;
    }

    /**
     * No parametrs
     */
    function checkTime() {
      setInterval(function() {
        var rememberTime = localStorage.getItem('rememberTime');
        if (getTime() === rememberTime) {
          const title = 'Ежедневное чтение Библии';
          const options = {
            body: 'Вы установили напоминание на это время.\n' +
            'Вам пора читать Библию!',
            icon: '/images/logo128.png'
          };
          swRegistration.showNotification(title, options);
        } else {
        }
      }, 50000);
    }

    var chooseTimeBtn = document.getElementById('chooseTimeBtn');

    chooseTimeBtn.addEventListener('click', function() {
      var time = document.getElementById('time').value;
      localStorage.setItem('rememberTime', time);
      var choosenTime = document.getElementById('choosenTime');
      if (localStorage.getItem('rememberTime')) {
        choosenTime.innerHTML = 'Вы установили напоминание на: ' +
          localStorage.getItem('rememberTime');
      }
      checkTime();
    });


    /**
     * No parametrs
     */
    function getProfile() {
      if (!userProfile) {
        var accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
          console.log('Access token must exist to fetch profile');
        }

        webAuth.client.userInfo(accessToken, function(err, profile) {
          if (profile) {
            userProfile = profile;
            if(!localStorage.getItem('userProfile')) {
              localStorage.setItem('userProfile', JSON.stringify(userProfile));
            }
            displayProfile();
          }

        });
      } else {
        displayProfile();
      }
    }

    /**
     * No parametrs
     */
    function displayProfile() {
      // display the profile
      var profile = localStorage.getItem('userProfile');
      var user = JSON.parse(profile);
      if(user !== '') {
        document.getElementById('user-name').innerHTML =
          user.name;
      } else {
        document.getElementById('user-name').innerHTML = 'Незнакомец';
      }
    }
  });

  /**
   * No parametrs
   * @return {today} date
   */
  function getTodayDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }
    var day = date.getDate();
    var today = year + '-' + month + '-' + day;

    return today;
  }

  /**
   * Add one string.
   * @param {string} req Path to request.
   */
  function getText(req) {
    var url = 'https://bible.lekha.pp.ua/' + req;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      localStorage.setItem(req, this.responseText);
    };
    xhr.onerror = function() {
      var data = {
        message: 'Вы в оффлайне. Для обновления подключитесь к интернету.'
      };
      snackBarContainer.MaterialSnackbar.showSnackbar(data);
    };
    xhr.send();
  }

  /**
   * Add two strings.
   * @param {string} req Path to request.
   * @param {string} domId Id of the DOM-tree.
   */
  function writeData(req, domId) {
    var text = JSON.parse(localStorage.getItem(req));

    if (text.date !== getTodayDate()) {
      localStorage.removeItem(req);
      document.getElementById(domId).innerHTML = '';
      location.reload();
    }

    var book = document.createElement('h4');
    book.innerHTML = text.book;
    document.getElementById(domId).appendChild(book);

    for (var i = 0; i < text.data.length; i++) {
      if (text.data[i].verse_number === '1' || i === 0) {
        var chapter = document.createElement('h6');
        chapter.innerHTML = 'Глава ' + text.data[i].chapter;
        document.getElementById(domId).appendChild(chapter);
      }

      var p = document.createElement('p');
      p.innerHTML = '<span>' + text.data[i].verse_number +
        '. </span>' + text.data[i].verse;
      document.getElementById(domId).appendChild(p);
    }
  }
  /**
   * No parametrs
   */
  function getDate() {
    // var date = new Date();
    // var day = date.getDate();
    // var month = date.getMonth() + 1;
    // var year = date.getFullYear();
    //
    // var d = day + '.' + month + '.' + year;
    document.getElementById('date').innerHTML = getTodayDate();
  }

  document.querySelector('.preo').addEventListener('click', function() {
    window.open("https://preo.in.ua");
  });
  // Your custom JavaScript goes here
  document.addEventListener('DOMContentLoaded', function() {
    getDate();
    getText('old');
    getText('new');
    getText('verse');
    writeData('old', 'old_text');
    writeData('new', 'new_text');
    writeData('verse', 'verse_text');
  });
})();

/*
 const applicationServerPublicKey = 'BNrl34blyO1PI41HcBpgHqfsLS5CvdrraJTb0YmuGbHU5GRQidRTsxWalC-5HJ3BuvDNk4O7DVzwtMuURvw7N-k';
 const pushButton = document.getElementById('switch-1');
 var isSubscribed = false;
 var swRegistration = null;

 // Check to make sure service workers are supported in the current browser,
 // and that the current page is accessed from a secure origin. Using a
 // service worker from an insecure origin will trigger JS console errors. See
 // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
 var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
 // [::1] is the IPv6 localhost address.
 window.location.hostname === '[::1]' ||
 // 127.0.0.1/8 is considered localhost for IPv4.
 window.location.hostname.match(
 /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
 )
 );

 if ('serviceWorker' in navigator &&
 (window.location.protocol === 'https:' || isLocalhost) &&
 'PushManager' in window) {
 navigator.serviceWorker.register('service-worker.js')
 .then(function(registration) {
 swRegistration = registration;
 // updatefound is fired if service-worker.js changes.
 registration.onupdatefound = function() {
 // updatefound is also fired the very first time the SW is installed,
 // and there's no need to prompt for a reload at that point.
 // So check here to see if the page is already controlled,
 // i.e. whether there's an existing service worker.
 if (navigator.serviceWorker.controller) {
 // The updatefound event implies that registration.installing is set:
 // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
 var installingWorker = registration.installing;

 installingWorker.onstatechange = function() {
 switch (installingWorker.state) {
 case 'installed':
 // At this point, the old content will have been purged and the
 // fresh content will have been added to the cache.
 // It's the perfect time to display a "New content is
 // available; please refresh." message in the page's interface.
 console.log('Succesfully installed');
 initialiseUI();
 break;

 case 'redundant':
 throw new Error('The installing ' +
 'service worker became redundant.');

 default:
 // Ignore
 }
 };
 }
 };
 }).catch(function(e) {
 console.error('Error during service worker registration:', e);
 });
 }
 else {
 console.warn('Push messaging is not supported');
 pushButton.textContent = 'Push Not Supported';
 }

 function initialiseUI() {
 pushButton.addEventListener('click', function() {
 pushButton.disabled = true;
 if (isSubscribed) {
 // TODO: Unsubscribe user
 } else {
 subscribeUser();
 }
 });

 // Set the initial subscription value
 swRegistration.pushManager.getSubscription()
 .then(function(subscription) {
 isSubscribed = !(subscription === null);

 updateSubscriptionOnServer(subscription);

 if (isSubscribed) {
 console.log('User IS subscribed.');
 } else {
 console.log('User is NOT subscribed.');
 }

 updateBtn();
 });
 }

 function subscribeUser() {
 const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
 swRegistration.pushManager.subscribe({
 userVisibleOnly: true,
 applicationServerKey: applicationServerKey
 })
 .then(function(subscription) {
 console.log('User is subscribed.');

 updateSubscriptionOnServer(subscription);

 isSubscribed = true;

 updateBtn();
 })
 .catch(function(err) {
 console.log('Failed to subscribe the user: ', err);
 updateBtn();
 });
 }
 function urlB64ToUint8Array(base64String) {
 const padding = '='.repeat((4 - base64String.length % 4) % 4);
 const base64 = (base64String + padding)
 .replace(/\-/g, '+')
 .replace(/_/g, '/');

 const rawData = window.atob(base64);
 const outputArray = new Uint8Array(rawData.length);

 for (var i = 0; i < rawData.length; ++i) {
 outputArray[i] = rawData.charCodeAt(i);
 }
 return outputArray;
 }

 function updateSubscriptionOnServer(subscription) {
 // TODO: Send subscription to application server
 const subscriptionJson = document.querySelector('.js-subscription-json');
 const subscriptionDetails =
 document.querySelector('.js-subscription-details');

 if (subscription) {
 subscriptionJson.textContent = JSON.stringify(subscription);
 // subscriptionDetails.classList.remove('is-invisible');
 } else {
 // subscriptionDetails.classList.add('is-invisible');
 }
 }

 function updateBtn() {
 if (Notification.permission === 'denied') {
 pushButton.textContent = 'Push Messaging Blocked.';
 pushButton.disabled = true;
 //updateSubscriptionOnServer(null);
 return;
 }

 if (isSubscribed) {
 pushButton.textContent = 'Disable Push Messaging';
 } else {
 pushButton.textContent = 'Enable Push Messaging';
 }

 pushButton.disabled = false;
 }

 */
