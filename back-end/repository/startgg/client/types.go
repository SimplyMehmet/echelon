package client

import (
	"encoding/json"
	"fmt"
	"strconv"
)

type ID string

func (id *ID) UnmarshalJSON(data []byte) error {
	var n string
	if err := json.Unmarshal(data, &n); err == nil {
		*id = ID(n)
		return nil
	}

	var s int
	if err := json.Unmarshal(data, &s); err != nil {
		return fmt.Errorf("invalid ID: %s", data)
	}

	intIDStringify := strconv.Itoa(s)
	*id = ID(intIDStringify)
	return nil
}
