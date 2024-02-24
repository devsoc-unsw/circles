- redis is just `session_token -> { sid, uid, exp }` (or eventually just use inbuilt TTL)
  - the sid is not just that token, its for all sessions that came from that refresh chain
  - to logout a session, kill all session_tokens that have the sid
  - index on sid and uid so we can do so
- tokens are just UNIQUE random strings
- in persisted somewhere
  - we store `refresh_token -> { sid, uid, exp }`
    - this needs to persist as we dont want to log out if server restarts
  - we store `sid -> { oidc_info, curr_refresh_token }`
    - this is used to refresh the oidc info when needed
    - and check that their oidc session is still up to date
  - we store `uid -> { sessions: sid[], user_info, ... }`

- a session token lasts 15 minutes
- a refresh token lasts 7-30 days (or as long as the oidc token does)
- sessions last as long as they are refreshed for
  - so give them a TTL of `ref_tok_TTL + 1` so if all refresh tokens get lost, they still die eventually
  - refresh this TTL everytime its refreshed

- now that tokens are opaque, on identity endpoint, we return
  - body: `{ session_token, exp, uid }`
    - use the uid for caching against
    - use the exp to figure out if we should do a preflight request for a new pair
  - cookies: `{ refresh_token }`

- TODO: what happens if we kill a session in mongo, but dont manage to kill its session tokens in redis
  - we should know, if this happens we can handle?
  - wont be able to refresh anyway so at MOST they get 15 minutes of play


### Current MongoDB userdb Schema
```
users {
  degree! { ... },
  courses { ... },
  planner! { ... },
}

tokens {
  token! string,
  objectId! objectId,
}
```

### New MongoDB+Redis Schema

#### Mongo
```
users {
  uid! string,     // unique indexed, the uid we get back from the oidc
  info! object,    // extra info that we gather from oidc
  sessions uuid[], // potentially dont use this and just index on sid
  degree! { ... },
  courses! { ... },
  planner! { ... },
}

refreshTokens {
  tok! string,     // unique indexed
  sid! uuid,       // indexed
  uid! string,     // indexed
  expiresAt! Date, // ttl indexed
}

sessions {
  sid! uuid,       // unique indexed
  uid! string,     // index on if we dont have the reverse lookup
  oidcInfo! object,
  currRefTok! string,
  expiresAt! Date, // ttl indexed (should be same as the currRefTok expiry time, or +1 day)
}
```

#### Redis
```
session_token:<token> {
  sid! uuid,       // indexed
  uid! string,     // indexed
} with TTL
```