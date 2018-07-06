# Nokia Health

[![Build Status](https://travis-ci.org/consult-kcl/nokia-health.svg?branch=nokia)](https://travis-ci.org/consult-kcl/nokia-health)

Middleware designed to improve interactions with the Nokia Health API, and thus Nokia Health devices.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Before installing, [download and install Node.js](https://nodejs.org/en/download/).

### Installing

Clone this repository:

```
git clone https://github.com/martinchapman/nokia-health.git
```

Change into the directory:

```
cd nokia-health
```

(Optional) From within the project folder, create a node virtual environment (within a python virtual environment), and activate it:

```
virtualenv env
. env/bin/activate
pip install nodeenv
nodeenv nenv
. nenv/bin/activate
```

Install dependencies:

```
npm install
```

Modify `lib/config.js` to include your `NOKIA_CONSUMER_KEY`, `NOKIA_SECRET` and `CALLBACK_BASE`, a publicly accessible end-point to receive callbacks from Nokia's API.

For notification callbacks, `php/nokia.php` should also be publicly accessible via your `CALLBACK_BASE`.

## Usage

From within the project folder, run with:

```
npm start
```

The app runs by default on port 5001.

Receive authorisation to query a user's Nokia device data by having them visit the URL generated at

```
http://localhost:5001/register
```

and authorise your application.

Then, retrieve an initial read of a user's body measures by visiting:

```
http://localhost:5001/dashboard/<userId>
```

## Running the tests

Run both unit and lint tests using `npm`:

```
npm test
```

## Deployment

Run in production using NODE_ENV environment variable, e.g.:

```
NODE_ENV=production npm start 
```

Deployed systems should switch to a production database format (e.g. Postgres).

## Built With

* [Express](https://expressjs.com/) - The web framework used.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/martinchapman/nokia-health/tags). 

## Authors

Produced as part of the [CONSULT project](https://consult.kcl.ac.uk/).
 
![CONSULT project](https://consult.kcl.ac.uk/wp-content/uploads/sites/214/2017/12/overview-consult-768x230.png "CONSULT project")

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

* Nokia's original health API [https://developer.health.nokia.com/api](https://developer.health.nokia.com/api).

