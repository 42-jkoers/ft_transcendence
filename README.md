# ft_transcendence
A full stack, dockerised single-page web app with TypeScript, NodeJS, NextJS OAauth, web sockets and more!

# Prerequisites
- gpg --> brew install gpg
- make
- nodeJS
- docker
- docker-compose

# Setup
```$ make```\
This will do the following:
1. Ask for a password
2. Decrypt ./backend/inject-secrets.sh.gpg to ./backend/inject-secrets.sh
3. Run ./backend/inject-secrets.sh
4. Copy ./backend/.env-example to ./backend/.env
5. Fill out all the secret data

If you edit the secrets in ./backend/inject-secrets.sh, then run `make encrypt-secrets-file` and commit the ./backend/inject-secrets.sh.gpg to store the secrets safely.
