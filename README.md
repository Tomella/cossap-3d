# cossap-3d

Cossap 3d is an application that is static in nature but can consume services
to represent elevation and imagery over Australia. All the services
consumed are public services and are configured in the
[Config](source/app/config.ts) file.

It can be seen in [action here](http://www.geospeedster.com/cossap3d/?bbox=140,-39.5,150.1,-33.5)

Keep in mind that the wired services are only in Australia and the extent is constrained to Australian bounds.

After cloning and cd'ing to the project root:

```bash
npm install
bower install
node server
```

Then the application should be running on [localhost](http://localhost:3000/?bbox=140,-39.5,150.1,-33.5)
