# DIARIUM API Docs

## HTTP Methods
`GET` is used to *receive* data from the server  
`POST` is used to *create* something  
`PUT` is used to *update* something  
`DELETE` is used to *delete* something

---

## GET REQUESTS

### GET all entries (*requires auth*)

**Endpoint**: `/api/entries`  
Returns an array containing every entry.  
Example response:

```json
[
  {
    "id": 1,
    "assignedDay": "2018-05-20",
    "content": "Hello World!",
    "contentType": "text/markdown",
    "tags": ["highlight", "vacation"],
    "createdAt": "2019-12-31T20:51:37.304Z",
    "updatedAt": "2020-01-10T12:46:49.132Z"
  },
  {
    "id": 2,
    "assignedDay": "2020-01-11",
    "content": "Hello Underworld!",
    "contentType": "text/markdown",
    "tags": [],
    "createdAt": "2019-12-31T20:51:41.435Z",
    "updatedAt": "2020-01-10T09:46:46.688Z"
  },
]
```

---

### GET entries (or certain parts) in specified range (*requires auth*)

**Endpoint**: `/api/entries/range`  
**Params**:  
— *required*: `start` and `end` indicating the start and end of the range. Format (Date): "YYYY-MM-DD".  
— *optional*: `column` (Array) returns only the DB columns specified here.

Returns an array containing every entry (or parts of it) in the provided range.  
Example request:  

```url
/api/entries/range/?start=2020-01-01&end=2020-01-10&column=assignedDay&column=content
```

Example response:  
**Note**: we provided two column parameters (=array)

```json
[
  {
    "assignedDay": "2020-01-04",
    "content": "Hello World!!!"
  },
  {
    "assignedDay": "2020-01-02",
    "content": "Test :)"
  }
]
```

---

## PLANS

* Add `orderBy` parameter to all GET requests (right now all responses are ordered by ID (ASC))
