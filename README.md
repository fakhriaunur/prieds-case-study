# prieds-case-study

## Assumptions

* Valid input
* No duplicate payloads

## TODO

- [X] Inspect the codebase
- [X] Deploy the codebase locally
- [X] Working on the function
- [X] Test the implemented function

## Implementation Points

* Create object from JSON input passed to the request body
* Create a list to store new qr payloads
* Create a list to store rejected qr payloads
* Remove any of the embedded payloads matching the new qr payloads
* Populate the new qr payloads list with the
* Update all status, status_qc of the embedded payloads matching the rejected payloads
* Remove all of the embedded payloads matching the rejected payloads
* Push all elements from the new qr payloads list to the matching top level document payload
* Export the collection to repacked_stock_read_log.json

## Postman Test Result

![1669607425490](image/README/1669607425490.png)
