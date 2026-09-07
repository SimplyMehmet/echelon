package team

import (
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
)

type Team struct {
	sqlRepository     *sql.Repository
	startGGRepository *startgg.Repository
}
