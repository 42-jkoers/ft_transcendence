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
all: $(SECRETSFILE)
	@echo "$(MAGENTA)start docker-compose...$(RESET)"
	COMPOSE_HTTP_TIMEOUT=120 docker-compose --project-name $(PROJECT) up --build -d

start: $(SECRETSFILE)
	@echo "$(MAGENTA)start all containers...$(RESET)"
	docker start $(CONTAINERS)

stop:
	@echo "$(MAGENTA)stop all containers...$(RESET)"
	docker stop $(CONTAINERS)

restart: stop start

database: $(SECRETSFILE)
	docker-compose --project-name $(PROJECT) up -d --no-deps --build $(SERVICES_DATABASE)

$(SECRETSFILE): $(SECRETSFILE_ENCRYPTED)
	gpg --yes --output $(SECRETSFILE) --decrypt $(SECRETSFILE_ENCRYPTED)
	@echo "$(MAGENTA)Injecting secrets$(RESET)"
	$$(cd backend && sh $(shell basename $(SECRETSFILE)))
	@echo "$(MAGENTA)Secrets injected succesfully$(RESET)"
	@echo ''

decrypt-secrets-file: $(SECRETSFILE)

encrypt-secrets-file:
	gpg --yes --no-symkey-cache --symmetric --output $(SECRETSFILE_ENCRYPTED) $(SECRETSFILE)

clean:
	@echo "$(MAGENTA)remove all containers/images/volumes...$(RESET)"
	docker-compose down --rmi all --volumes --remove-orphans

fclean:
	docker system prune -a -f --volumes

re: fclean all

.PHONY: all clean fclean re start stop restart decrypt-secrets-file encrypt-secrets-file
