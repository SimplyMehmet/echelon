package client

import (
	"encoding/json"
	"fmt"
	"strconv"
)

type ID int64

func (id *ID) UnmarshalJSON(data []byte) error {
	var n int64
	if err := json.Unmarshal(data, &n); err == nil {
		*id = ID(n)
		return nil
	}

	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return fmt.Errorf("invalid ID: %s", data)
	}

	n, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid ID %q: %w", s, err)
	}

	*id = ID(n)
	return nil
}
