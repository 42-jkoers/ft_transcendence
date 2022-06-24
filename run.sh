# Abort the script at the first error
set -e

# Color
RESET_COLOR='\033[0m'
BLACK_BOLD='\033[1;30m'
RED_BOLD='\033[1;31m'
GREEN_BOLD='\033[1;32m'
YELLOW_BOLD='\033[1;33m'
BLUE_BOLD='\033[1;34m'
MAGENTA_BOLD='\033[1;35m'
CYAN_BOLD='\033[1;36m'
WHITE_BOLD='\033[1;37m'
RESET_COLOR='\033[0m'
BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'

#COMMAND
STOP_CONTAINERS="docker stop ft_transcendence_postgres ft_transcendence_pgadmin"

# Build upload directory for avatar upload
[ ! -d ./upload/ ] && mkdir ./upload/

# Start
if [ "$1" == "stop" ]; then
	$STOP_CONTAINERS
else
	# delete database volume and rebuild
	if [ "$1" == "-v" ]; then
		$STOP_CONTAINERS
		docker rm ft_transcendence_postgres
		docker volume rm ft_transcendence_pgdata
	fi
	make database
	cd backend && npm run start:dev
fi
