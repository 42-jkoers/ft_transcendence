# color setting
RESET = \033[0;0m
MAGENTA = \033[1;35m\033[47m

PROJECT = ft_transcendence
SERVICES = backend postgres
CONTAINERS = $(addprefix $(PROJECT)_, $(SERVICES))
IMAGES = ft_transcendence_backend postgres

all:
	@echo "$(MAGENTA)start docker-compose...$(RESET)"
	docker-compose -f ./docker-compose.yml up --build -d

start:
	@echo "$(MAGENTA)start all containers...$(RESET)"
	docker start $(CONTAINERS)

stop:
	@echo "$(MAGENTA)stop all containers...$(RESET)"
	docker stop $(CONTAINERS)

restart: stop start

clean:
	@echo "$(MAGENTA)remove all containers/images/volumes...$(RESET)"
	docker-compose -f ./docker-compose.yml down --rmi all --volumes --remove-orphans

fclean: clean

re: fclean all

.PHONY: all clean fclean re start stop restart
