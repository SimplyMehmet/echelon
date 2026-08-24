package config

import (
	"sync"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Debug               bool   `envconfig:"DEBUG" default:"false"`
	MariaDBRootPassword string `envconfig:"MARIADB_ROOT_PASSWORD" default:"admin"`
	MariaDBRootUser     string `envconfig:"MARIADB_ROOT_USER" default:"root"`
	MariaDBHost         string `envconfig:"MARIADB_HOST" default:"db"`
	MariaDBPort         string `envconfig:"MARIADB_PORT" default:"3306"`
	MariaDBDatabase     string `envconfig:"MARIADB_DATABASE" default:"echelon"`
}

var once sync.Once
var config Config

func Load() Config {
	once.Do(func() {
		// if no env file found
		// godotenv.Overload() throws error
		// this can be ignored
		_ = godotenv.Overload()
		envconfig.MustProcess("", &config)
	})

	return config
}
