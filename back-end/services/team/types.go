package team

import (
	"echelon.com/repository/sql"
	"echelon.com/repository/startgg"
)

type Team struct {
	sqlRepository     *sql.Repository
	startGGRepository *startgg.Repository
}
