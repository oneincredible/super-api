# Super API

Hyper-Opinionated Framwork for Building a REST API.


## Summary

Super API is a hyper-opinionated framework for building REST APIs.

* **Immutable RDBMS Storage**

  All writes leave a perfect audit history. Data fields are never overwritten implicitly.
  This is enforced to the degree that data tables only need `INSERT` grants.

* **CQRS Enforced**

  Framework adheres to Command Query Responsibility Segregation. This means in practice that
  `POST`, `DELETE`, and `PUT` never returns data and all data fetching using `GET` must be
  performed explicitly by clients.

* **UUID enforced as id for objects.**

  Abandoning serial ids avoids conflicts and optimizes opportunities for parallellism.

* **Client side Id generation.**

  Server side will never generate ids for objects. This avoids clients from needing two sets of ids
  when handling state in memory and removes the need for colleting data back from the server as objects
  are created.

* **Shallow API**

  Model fields can only be of three main types; Primitives, Models, and List of Models.

  Demonstrated in the example below, there are only the three fields `value`, `model`, and `list`.
  Everything must be composed from these three types and it can. You need to think harder,
  and the return on investment is big in the form of a simple API.

  ```javascript
  export const ChildModel = Model([
    Field.value('name'),
  ], 'child');

  export const ParentModel = Model([
    Field.model('child', ChildModel),
    Field.list('children', ChildModel)
  ], 'parent');
  ```


## Usage

### Install

```bash
yarn add @oneinc/super-api
```
