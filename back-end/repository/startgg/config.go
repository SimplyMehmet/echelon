package startgg

type SeasonType string
type TournamentSeasonConfiguration struct {
	Name             string
	StartGGSource    string
	Type             SeasonType
	CurrentSeason    bool
	DoubleXPEventIDs map[int64]bool
	Teams            map[int64]string
}

const (
	Tournament SeasonType = "tournament"
	League     SeasonType = "league"
)

var PointsByPlacement = map[int64]int64{
	1:  25,
	2:  18,
	3:  15,
	4:  12,
	5:  10,
	6:  8,
	7:  6,
	8:  4,
	9:  2,
	10: 1,
}

var PlayerIDsByName = map[string]int64{
	"metabyte":        706123,
	"darkmgm":         3397099,
	"tyronz":          4044497,
	"oats":            840460,
	"faccboi":         2015693,
	"tarekt":          5177230,
	"aphyda":          5164839,
	"whytebar":        5164851,
	"sin":             3138169,
	"karmakens":       1093899,
	"lilmayo":         1486131,
	"scorpion":        4819892,
	"yuukoo":          4860268,
	"kneelforyoshi":   5151182,
	"divinekai666":    4819963,
	"henbro":          3044121,
	"ilias":           3429775,
	"probaze":         4603073,
	"rahil":           2032975,
	"tsuno":           4122212,
	"shanq":           4819847,
	"geno":            5038589,
	"swavythefox":     5164785,
	"andoza":          5117080,
	"buffalo_soldier": 822600,
	"kevtexgaming":    4410050,
	"malekith":        426295,
	"bigfelixio":      5142611,
	"aphrod1s1a":      3020311,
	"jul":             1075406,
	"sakujo":          4819877,
	"wenk67":          5490644,
}

var Seasons = map[string]TournamentSeasonConfiguration{
	"S0": {
		Name:             "Tekken League Season 0",
		StartGGSource:    "levels-2025-28-30-dec",
		Type:             "tournament",
		CurrentSeason:    false,
		DoubleXPEventIDs: map[int64]bool{},
		Teams:            map[int64]string{},
	},

	"S1": {
		Name:             "Tekken League Season 1",
		StartGGSource:    "levels-tekken-8-2026-season-1",
		Type:             "tournament",
		CurrentSeason:    false,
		DoubleXPEventIDs: map[int64]bool{},
		Teams:            map[int64]string{},
	},

	"S2": {
		Name:             "Tekken League Season 2",
		StartGGSource:    "levels-tekken-league-season-2",
		Type:             "league",
		CurrentSeason:    false,
		DoubleXPEventIDs: map[int64]bool{},
		Teams:            map[int64]string{},
	},

	"S3": {
		Name:          "Tekken League Season 3",
		StartGGSource: "levels-tekken-league-season-3",
		Type:          "tournament",
		CurrentSeason: true,
		DoubleXPEventIDs: map[int64]bool{
			1689341: true,
			1696410: true,
			1696415: true,
			1696416: true,
			1696417: true,
		},
		Teams: map[int64]string{
			PlayerIDsByName["metabyte"]: "Dragon",
			PlayerIDsByName["darkmgm"]:  "Dragon",
			PlayerIDsByName["tyronz"]:   "Dragon",
			PlayerIDsByName["oats"]:     "Dragon",
			PlayerIDsByName["faccboi"]:  "Dragon",
			PlayerIDsByName["tarekt"]:   "Dragon",
			PlayerIDsByName["aphyda"]:   "Dragon",
			PlayerIDsByName["whytebar"]: "Dragon",

			PlayerIDsByName["sin"]:           "Tarantula",
			PlayerIDsByName["karmakens"]:     "Tarantula",
			PlayerIDsByName["lilmayo"]:       "Tarantula",
			PlayerIDsByName["scorpion"]:      "Tarantula",
			PlayerIDsByName["yuukoo"]:        "Tarantula",
			PlayerIDsByName["kneelforyoshi"]: "Tarantula",
			PlayerIDsByName["divinekai666"]:  "Tarantula",
			PlayerIDsByName["henbro"]:        "Tarantula",

			PlayerIDsByName["ilias"]:       "Mantis",
			PlayerIDsByName["probaze"]:     "Mantis",
			PlayerIDsByName["rahil"]:       "Mantis",
			PlayerIDsByName["tsuno"]:       "Mantis",
			PlayerIDsByName["shanq"]:       "Mantis",
			PlayerIDsByName["geno"]:        "Mantis",
			PlayerIDsByName["swavythefox"]: "Mantis",
			PlayerIDsByName["andoza"]:      "Mantis",

			PlayerIDsByName["buffalo_soldier"]: "Phoenix",
			PlayerIDsByName["kevtexgaming"]:    "Phoenix",
			PlayerIDsByName["malekith"]:        "Phoenix",
			PlayerIDsByName["bigfelixio"]:      "Phoenix",
			PlayerIDsByName["aphrod1s1a"]:      "Phoenix",
			PlayerIDsByName["jul"]:             "Phoenix",
			PlayerIDsByName["sakujo"]:          "Phoenix",
			PlayerIDsByName["wenk67"]:          "Phoenix",
		},
	},
}
