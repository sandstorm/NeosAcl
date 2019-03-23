# Sandstorm Neos ACL

THIS IS NO WORKING CODE YET, BUT SHARED HERE FOR DEV PURPOSES SO FAR.

## Development 

**Initial (Package) Setup**

- clone this package as "Sandstorm.NeosAcl" in the DistributionPackages of a Neos 4.2 or later installation
- add it to `composer.json` as `"sandstorm/neosacl": "*"`
- run `composer update`
 
**Initial React Setup**

```
cd Resources/Private/react-acl-editor
yarn
yarn start
```

**You need to START THE REACT DEVELOPMENT SERVER at every time you are developing the application** (using `yarn start`).

Then, log into the backend of Neos, and visit the module "Dynamic Roles".

### TODO list

- [ ] build dynamic ACL Privilege Matcher editor
    - [ ] remove hard-coded node types in PermissionWidget and pass them in via JSON (in index.tsx) from the enclosing site
    - [ ] allow to select a Node
        - [ ] build backend endpoint for node search (based on NodeSearchService)
        - [ ] use this endpoint in the component
    - [ ] send the generated Privilege Matchers as JSON as part of the outer form
    - [ ] initialize the Privilege Matchers in React from the outer form (in index.tsx)
    - [ ] fix React CSS styling to work with Neos Backend
    - [ ] include the statically-built JS files in production mode
- [ ] fully implement DynamicRoleGeneratorService
- [ ] visualize DENY in Permission Browser
- [ ] add proper README with usage instructions
