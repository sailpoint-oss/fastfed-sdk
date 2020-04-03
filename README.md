# FastFed SDK - Identity Provider and Application Provider Demo

The purpose of this project is to demonstrate the FastFed specification.  There are two SDKs: Java and NodeJS. 

Currently, there are two demo apps that represent examples of using the NodeJS SDK. An example of using the JavaSDK exists,
but it is currently being prepared for open-sourcing it and will come at a later date. 

# Get Running

The first step is to configure your machine with the following host entries:

	127.0.0.1		keycloak
	127.0.0.1		app-provider
	127.0.0.1		idp
	127.0.0.1		idp-gov

Once that has been completed, go to the root of the project's `docker` folder.  

From there, run `docker-compose build` and once that has successfully completed, run `docker-compose up`.  This will run 4 containers:

#### Keycloak 
The Identity Provider.  This is the actual IdP that will be used as the SSO provider.

#### IdP 
This is the FastFed Identity Provider Demo application that run "on top of" Keycloak.  In a real world scenario,
this would be native to an IdP's implementation.  For the demo, and to demonstrate working with other IdPs (Adfs, etc),
it is a stand alone application that is a client in Keycloak.  

It also supports ADFS, although it has not been used with ADFS in a while.  With minimal effort, it should work.  There is an ADFS Identity Provider
in the `fastfed-idp-app-server/server/src/providers` that can be used by following the similar way that Keycloak is configured.

#### App-provider
This is the FastFed Application Provider Demo application that is responsible for initiating SSO and SCIM Provisioning FastFed handshakes.

#### Sdk
This container is the FastFed NodeJS SDK that is shared by the IdP and App Provider containers and `npm link`-ed by the other containers to allow for any changes to the SDK module to
be picked up by the container applications that use them.

# Basic usage

To start:

- Visit `http://app-provider:8010`  
- Click `Configuration` on the side-bar navigation.  
- Choose a provider.  There is currently only one SSO provider.  There will be a Governance provider added when the Java demo is released.
- Follow the steps in the wizard
- This will eventually launch the IdP to continue the FastFed handshake for setting up the SSO relationship
- When the IdP launches, login to Keycloak as username `admin` and password `admin`
- You will be redirected to the IdP to continue
- Follow the IdP's wizard steps to consent/confirm the requested handshake information and continue with the FastFed process
- Once completed, you should see a success message.  
- Refresh the page and select `Relying Parties` to see that the application provider has been added.
- Return to the application provider and choose `Single Sign-On` to see the IdP's SAML Xml.


# TODO 

### FastFed Specification Missing Implementation

- List of what else is needed to be done to be 100% compliant with the latest FastFed specification.

### Other

- Tons more documentation/explanations.
- JavaSDK feature parity with the NodeSDK 
	- Discovery, consenting, etc.  This will require some additions to the SDK to mirror how the 
	NodeSDK handles the discovery and consenting.  
	- The interfaces for the providers need to be updated
	- Update to the latest spec
- Better error handling and conformance checking around the FastFed metadata JSON objects.
- Test harness (taking volunteers! :))
- FastFed Handshake Retry logic

# Code scaffolding

Coming soon!

# Build

This is currently a demo development environment and therefore doesn't truly support a build scenario or a production build. There
is some basic work in this project to provide some support for building a distribution, but it is not supported and
should be considered completely untested and most likely broken.  It has been kept in for any potential future build configuration/processes.

# Running unit tests

Coming soon!

# Running end-to-end tests

Coming soon!

## Further help

Coming soon!
