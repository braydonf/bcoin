# Bcoin

**Bcoin** is an alternative implementation of the bitcoin protocol, written in
JavaScript/C/C++/Node.js.

Bcoin is well tested and aware of all known consensus rules. It is currently
used in production as the consensus backend and wallet system for
[purse.io][purse].

## Install

```
$ git clone git://github.com/bcoin-org/bcoin.git
$ cd bcoin
$ yarn install
$ ./bin/bcoin
```

See the [Getting started][guide] guide for more in-depth installation
instructions, including verifying releases and necessary dependencies.

## Documentation

- General docs: [docs/](docs/README.md)
- Wallet and node API docs: https://bcoin.io/api-docs/
- Library API docs: https://bcoin.io/docs/

## Packages

This repository has several packages that can be used independently. All
dependencies are included in the source tree. There is therefore no dependency
on external services for fetching and securing dependencies.

## Support

Join us on [freenode][freenode] in the [#bcoin][irc] channel.

## Disclaimer

Bcoin does not guarantee you against theft or lost funds due to bugs, mishaps,
or your own incompetence. You and you alone are responsible for securing your
money.

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`

## License

- Copyright (c) 2014-2015, Fedor Indutny (MIT License).
- Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).

See LICENSE for more info.

[purse]: https://purse.io
[guide]: docs/getting-started.md
[freenode]: https://freenode.net/
[irc]: irc://irc.freenode.net/bcoin
