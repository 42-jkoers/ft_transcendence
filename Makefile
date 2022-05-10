###### color setting ######
RESET = \033[0;0m
MAGENTA = \033[1;35m\033[47m

###### names ######
PROJECT = ft_transcendence
SERVICES_DATABASE = postgres pgadmin redis
SERVICES = $(SERVICES_DATABASE) backend 
CONTAINERS = $(addprefix $(PROJECT)_, $(SERVICES))
IMAGES = postgres dpage/pgadmin4 redis ft_transcendence_backend

###### compilation ######
all:
	@echo "$(MAGENTA)start docker-compose...$(RESET)"
	docker-compose up --build -d

start:
	@echo "$(MAGENTA)start all containers...$(RESET)"
	docker start $(CONTAINERS)

stop:
	@echo "$(MAGENTA)stop all containers...$(RESET)"
	docker stop $(CONTAINERS)

restart: stop start

database:
	docker-compose up -d --no-deps --build $(SERVICES_DATABASE)

clean:
	@echo "$(MAGENTA)remove all containers/images/volumes...$(RESET)"
	docker-compose down --rmi all --volumes --remove-orphans

fclean: clean

re: fclean all

.PHONY: all clean fclean re start stop restart
