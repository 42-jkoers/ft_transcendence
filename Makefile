###### color setting ######
RESET = \033[0;0m
MAGENTA = \033[1;35m\033[47m

###### names ######
PROJECT = ft_transcendence
SERVICES_DATABASE = postgres pgadmin redis
SERVICES = $(SERVICES_DATABASE) backend frontend
CONTAINERS = $(addprefix $(PROJECT)_, $(SERVICES))
IMAGES = postgres dpage/pgadmin4 redis ft_transcendence_backend ft_transcendence_frontend
SECRETSFILE = backend/inject-secrets.sh
SECRETSFILE_ENCRYPTED = $(SECRETSFILE).gpg

###### compilation ######
all: decrypt-secrets-file
	@echo "$(MAGENTA)start docker-compose...$(RESET)"
	docker-compose --project-name $(PROJECT) up --build -d

start: decrypt-secrets-file
	@echo "$(MAGENTA)start all containers...$(RESET)"
	docker start $(CONTAINERS)

stop:
	@echo "$(MAGENTA)stop all containers...$(RESET)"
	docker stop $(CONTAINERS)

restart: stop start

database: decrypt-secrets-file
	docker-compose --project-name $(PROJECT) up -d --no-deps --build $(SERVICES_DATABASE)

$(SECRETSFILE): $(SECRETSFILE_ENCRYPTED)
	gpg --output $(SECRETSFILE) --decrypt $(SECRETSFILE_ENCRYPTED)

decrypt-secrets-file: $(SECRETSFILE)
	sh $(SECRETSFILE)

encrypt-secrets-file:
	gpg --yes --no-symkey-cache --symmetric --output $(SECRETSFILE_ENCRYPTED) $(SECRETSFILE)

clean:
	@echo "$(MAGENTA)remove all containers/images/volumes...$(RESET)"
	docker-compose down --rmi all --volumes --remove-orphans

fclean: clean

re: fclean all

.PHONY: all clean fclean re start stop restart decrypt-secrets-file encrypt-secrets-file
