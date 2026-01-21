# Feathers vs Firebase

Firebase is a hosted platform for mobile or web applications. Just like Feathers, Firebase provides REST and real-time APIs but also includes CDN support. Feathers on the other hand leaves setting up a CDN and hosting your Feathers app up to the developer.

Firebase is a closed-source, paid hosted service starting at $5/month with the next plan level starting at $49/month. Feathers is open source and can run on any hosting platform like Heroku, Modulus or on your own servers like Amazon AWS, Microsoft Azure, Digital Ocean and your local machine. Because Firebase can't be run locally you typically need to pay for both a shared development environment on top of any production and testing environment.

Firebase has JavaScript and mobile clients and also provides framework specific bindings. Feathers currently focuses on universal usage in JavaScript environments and does not have any framework specific bindings. Mobile applications can use Feathers REST and websocket endpoints directly but at the moment there are no Feathers specific iOS and Android SDKs.

Firebase currently supports offline mode whereas that is currently left up to the developer with Feathers.

Both Firebase and Feathers support email/password, token, and OAuth authentication. Firebase has not publicly disclosed the database technology they use to store your data behind their API but it seems to be an SQL variant. Feathers supports multiple databases, NoSQL and SQL alike.

For more technical details on the difference and how to potentially migrate an application you can read [how to use Feathers as an open source alternative to Firebase](https://medium.com/all-about-feathersjs/using-feathersjs-as-an-open-source-alternative-to-firebase-b5d93c200cee#.olu25brld).