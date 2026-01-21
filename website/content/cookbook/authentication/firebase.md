

# Firebase

[Firebase](https://firebase.google.com/docs/auth) requires a custom [OAuth Authentication Strategy](../../api/authentication/oauth.html#oauthstrategy). This is because one is not provided to us, by the default [Grant](https://github.com/simov/grant) configuration Feathers uses for [OAuth](https://docs.feathersjs.com/api/authentication/oauth.html#oauth).

Since Firebase does not provide a UI for us to redirect to, we use flow #2 outlined in [OAuth Flow](../../api/authentication/oauth.html#flow).

## Authentation Setup

Update `config/default.json`:

```json
{
  "authentication": {
    "oauth": {}
  },
  "firebase": {
    "type": "THIS SHOULD BE YOUR SERVICE ACCOUNT",
    "project_id": "GENERATED UNDER FIREBASE CONSOLE",
    "...": "..."
  }
}

```
> Note: Since Firebase can be used for more than just authentication, we'll store our service account in the root of our config. Otherwise, if preferred, you can store under `authentication.oauth`.

## Authentication Strategy

Create a file under `src/firebase.js`:

```js
const firebase = require('firebase-admin');
const { OAuthStrategy } = require('@feathersjs/authentication-oauth');
const { NotAuthenticated } = require('@feathersjs/errors');

const logger = require('./logger');

function initialize(app){
  const firebaseConfig = app.get('firebase');

  // Initialize app
  try {
    firebase.initializeApp({
      credential: firebase.credential.cert(firebaseConfig)
    });
  } catch (e) {
    console.log('erorr initializing firebase', e);
  }
}

class FirebaseStrategy extends OAuthStrategy {

  async authenticate(authentication, params){
    logger.debug('firebase:strategy:authenticate');
    return super.authenticate(authentication, params);
  }

  async getProfile(data, _params){
    const firebase = require('firebase-admin');
    let user;

    try {
      user = await firebase.auth().verifyIdToken(data.access_token);
    } catch(e){
      logger.error(e);
      throw new NotAuthenticated();
    }

    logger.debug(`firebase:strategy:getProfile:successful ${user.user_id}`);

    return {
      email: user.email,
      id: user.user_id
    };
  }

  async getEntityData(profile) {
    const baseData = await super.getEntityData(profile);

    return {
      ...baseData,
      email: profile.email
    };
  }
}

module.exports = { initialize, FirebaseStrategy };
```

Now we can edit `src/authentication.js`

```js
const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { expressOauth } = require('@feathersjs/authentication-oauth');

const { FirebaseStrategy } = require('./firebase');

module.exports = app => {
  const authentication = new AuthenticationService(app);

  authentication.register('firebase', new FirebaseStrategy());

  app.use('/authentication', authentication);
  app.configure(expressOauth());
};
```

## Building frontend

To save time, you can leverage the pre-built UI provided by [Firebase UI](https://firebase.google.com/docs/auth/web/firebaseui).

### Create auth page

First, create a `public/firebase_auth.html` file that initializes everything we'll need for our different auth components.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Firebase Authentication Example</title>
  <!-- The core Firebase JS SDK is always required and must be listed first -->
  <script src="https://www.gstatic.com/firebasejs/7.21.0/firebase-app.js"></script>

  <!-- TODO: Add SDKs for Firebase products that you want to use
       https://firebase.google.com/docs/web/setup#available-libraries -->
  <script src="https://www.gstatic.com/firebasejs/7.21.0/firebase-auth.js"></script>

  <!-- Firebase UI -->
  <script src="https://www.gstatic.com/firebasejs/ui/4.6.1/firebase-ui-auth.js"></script>
  <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/4.6.1/firebase-ui-auth.css" />

</head>
<body>
  <!-- The surrounding HTML is left untouched by FirebaseUI.
      Your app may use that space for branding, controls and other customizations.-->
  <h1>Welcome to My Awesome App</h1>

  <!-- Optionally show a preparing state, until the guest or member app is ready. Usually after authentication is determined -->
  <div id="app-preparing"></div>

  <!-- App for guests to auth, etc. -->
  <div id="app-guest" style="display: none;">
    <div id="firebaseui-auth-container"></div>
    <div id="loader">Loading...</div>
  </div>

  <!-- App for members only -->
  <div id="app-member" style="display: none;"></div>

  <!-- Custom -->
  <script src="//unpkg.com/@feathersjs/client@^4.3.0/dist/feathers.js"></script>
  <script src="/socket.io/socket.io.js"></script>
  <script src="/client.js"></script>
</body>
</html>
```

### Initialize client w/Firebase auth
Now, let's make a `public/client.js` file where all of our JavaScript will live.

> Be sure to update `firebaseConfig` with the one provided from your [Firebase Console](https://console.firebase.google.com/). Additionally, checkout [Firebase UI](https://firebase.google.com/docs/auth/web/firebaseui) docs for more information on customizing `ui.start`. This includes theming options, all providers supported by Firebase & more.

```js
let client, ui;

init();

function init(){
  initializeFeathers();
  initializeAuth();
  initializeFirebase();
}

function initializeFeathers(){
  // Establish a Socket.io connection
  const socket = io();
  // Initialize our Feathers client application through Socket.io
  // with hooks and authentication.
  client = feathers();

  client.configure(feathers.socketio(socket));
  // Use localStorage to store our login token
  client.configure(feathers.authentication());
}

// Either re-authenticate existing session, or start Firebase UI
async function initializeAuth(){
  try {
    await client.reAuthenticate();
    showMemberApp();
  } catch(e){
    // Error re-authenticating, so let's start Firebase UI
    showGuestApp();
  }

  // No longer need to prepare anything
  document.getElementById('app-preparing').style.display = 'none';
}

function initializeFirebase(){
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    // Copy this from your Firebase Console
    // Under Project Settings -> Web App
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Initialize the FirebaseUI Widget using Firebase.
  ui = new firebaseui.auth.AuthUI(firebase.auth());
}

async function showMemberApp(){
  // Get user information
  const { user } = await client.get('authentication');

  // Hide Guest App
  document.getElementById('app-guest').style.display = 'none';

  // Show member app
  document.getElementById('app-member').style.display = 'block';
  document.getElementById('app-member').innerHTML = `Logged in as, ${user.email}. <a href="#" id="logout">Logout</a>`;

}

function showGuestApp(){
  // Hide & clear member app
  document.getElementById('app-member').style.display = 'none';
  document.getElementById('app-member').innerHTML = '';

  // Show Guest app
  document.getElementById('app-guest').style.display = 'block';
  startFirebaseUI();
}

function startFirebaseUI(){
  ui.start('#firebaseui-auth-container', {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(async function(idToken) {
          await client.authenticate({
            strategy: 'firebase',
            access_token: idToken,
          });
          showMemberApp();
        });

        return false;
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    credentialHelper: firebaseui.auth.CredentialHelper.NONE, // disable accountchooter.com helper
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    ],
    // Other config options...
  });
}

const addEventListener = (selector, event, handler) => {
  document.addEventListener(event, async ev => {
    if (ev.target.closest(selector)) {
      handler(ev);
    }
  });
};

// "Logout" button click handler
addEventListener('#logout', 'click', async () => {
  await client.logout();

  showGuestApp();
});
```

Now you should be able to visit your Firebase auth at the

```
http://localhost:3030/firebase_auth.html
```

page locally and authenticate w/any Firebase Providers you've set up in your Firebase Project 🔥
