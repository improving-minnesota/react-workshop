# Lab Four - Adding Flux to the Application

## Checkout the Lab Branch
- In a terminal:

```
git checkout lab-04-flux-start
git pull
```
&nbsp;
### Check it out!

- Before doing anything, let's look at the progress that has already been completed by the team on the application.
  - Peruse the **client/src/components** directory and notice that the **Projects** and **Timesheets** modules have been implemented by the team.
  - We will be building out the **Dispatcher** and **Store** Flux components.
  - We will use the **Store** Component to implement an **EmployeeStore** component to handle your business.
  - We will then build our our **EmployeeActions** to communicate with the **EmployeeStore**.
  - Finally we will register our **Employees** controller component to listen for updates from our **EmployeeStore** and have our **EmployeeRow** notify the store of any changes.
  - The module files have been stubbed out for us, we just need to add the codez.

&nbsp;
### Create our Dispatcher

flux/flux.dispatcher.js
```javascript
  handleViewAction: function(action) {
    this.dispatch({
      source: 'VIEW_ACTION',
      action: action
    });
  }
```

flux/flux.dispatcher.spec.js
```javascript
  describe('handling a view action', function () {
    it('should dispatch the action with a source of VIEW_ACTION', function () {
      dispatcher.handleViewAction('testAction');
      expect(spies.dispatch).to.have.been.calledWith({source: 'VIEW_ACTION', action: 'testAction'});
    });
  });
```

&nbsp;
### Create the Store

flux/flux.store.js
```javascript
  state: {},

  getState: function () {
    return this.state;
  },

  setState: function (state) {
    this.state = _.extend(this.state, state);
  },

  emitChange: function () {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  register: function (events) {
    var self = this;

    dispatcher.register(function (payload) {
      var action = payload.action;
      var promise = events[action.actionType];

      if (!_.isUndefined(promise)) {
        promise.apply(self, [payload])
          .then(function () {
            self.emitChange();
          });
      }
      return true;
    });
  }
```

&nbsp;
### Create the Store

actions/employee.actions.js
```javascript
  LIST: 'LIST_EMPLOYEES',
  GET: 'GET_EMPLOYEE',
  CREATE: 'CREATE_EMPLOYEE',
  UPDATE: 'UPDATE_EMPLOYEE',
  DELETE: 'DELETE_EMPLOYEE',
  RESTORE: 'RESTORE_EMPLOYEE',

  list: function (query) {
    dispatcher.handleViewAction({
      actionType: EmployeeActions.LIST,
      query: query
    });
  },

  get: function (id) {
    dispatcher.handleViewAction({
      actionType: EmployeeActions.GET,
      employee: {_id: id}
    });
  },

  create: function (employee) {
    dispatcher.handleViewAction({
      actionType: EmployeeActions.CREATE,
      employee: employee
    });
  },

  update: function (employee) {
    dispatcher.handleViewAction({
      actionType: EmployeeActions.UPDATE,
      employee: employee
    });
  },

  remove: function (employee) {
    dispatcher.handleViewAction({
      actionType: EmployeeActions.DELETE,
      employee: employee
    });
  },

  restore: function (employee) {
    dispatcher.handleViewAction({
      actionType: EmployeeActions.RESTORE,
      employee: employee
    });
  }
```

&nbsp;
### Create the Store

actions/employee.actions.spec.js
```javascript
  beforeEach(function () {
    React = require('react/addons');
    TestUtils = React.addons.TestUtils;
    _ = require('lodash');
    fluxDispatcher = require('../flux/flux.dispatcher');
  });

  beforeEach(function () {
    EmployeeActions = require('./employee.actions');

    dispatcher = sinon.stub(fluxDispatcher, 'handleViewAction', _.noop);
  });

  afterEach(function () {
    dispatcher.restore();
  });

  it('should instantiate the EmployeeActions', function () {
    expect(EmployeeActions).to.be.defined;
  });

  describe('firing a list action', function () {
    beforeEach(function () {
      query = "query";
      EmployeeActions.list(query);

      payload = {query: query, actionType: EmployeeActions.LIST};
    });

    it('should dispatch a view action with the query and a type of LIST', function () {
      expect(dispatcher).to.have.been.calledWith(payload);
    });
  });

  describe('firing a get action', function () {
    beforeEach(function () {
      id = "testId";
      EmployeeActions.get(id);

      payload = {employee: {_id: id}, actionType: EmployeeActions.GET};
    });

    it('should dispatch a view action with the id and a type of GET', function () {
      expect(dispatcher).to.have.been.calledWith(payload);
    });
  });

  describe('firing a create action', function () {
    beforeEach(function () {
      EmployeeActions.create(employee);

      payload = {employee: employee, actionType: EmployeeActions.CREATE};
    });

    it('should dispatch a view action with the employee and a type of LIST', function () {
      expect(dispatcher).to.have.been.calledWith(payload);
    });
  });

  describe('firing a update action', function () {
    beforeEach(function () {
      EmployeeActions.update(employee);

      payload = {employee: employee, actionType: EmployeeActions.UPDATE};
    });

    it('should dispatch a view action with the employee and a type of UPDATE', function () {
      expect(dispatcher).to.have.been.calledWith(payload);
    });
  });

  describe('firing a remove action', function () {
    beforeEach(function () {
      EmployeeActions.remove(employee);

      payload = {employee: employee, actionType: EmployeeActions.DELETE};
    });

    it('should dispatch a view action with the employee and a type of DELETE', function () {
      expect(dispatcher).to.have.been.calledWith(payload);
    });
  });

  describe('firing a restore action', function () {
    beforeEach(function () {
      EmployeeActions.restore(employee);

      payload = {employee: employee, actionType: EmployeeActions.RESTORE};
    });

    it('should dispatch a view action with the employee and a type of RESTORE', function () {
      expect(dispatcher).to.have.been.calledWith(payload);
    });
  });
```

&nbsp;
### Create the Store


stores/employee.store.js
```javascript
  initialize: function () {
    var events = {};
    events[actions.LIST]    = this.list;
    events[actions.GET]     = this.get;
    events[actions.UPDATE]  = this.update;
    events[actions.DELETE]  = this.remove;
    events[actions.RESTORE] = this.restore;
    events[actions.CREATE]  = this.create;
    this.register(events);

    this.setState({
      employee: {},
      pageConfig: {
        data: [],
        totalItems: 0,
        limit: 5,
        page: 1
      }
    });

    return this;
  },

  url: function (employeeId) {
    var url = '/users';
    if (employeeId) {
      url += '/' + employeeId;
    }

    return url;
  },

  list: function (payload) {
    var self = this;

    return axios.get(this.url(), {params: payload.action.query})
      .then(function (res) {
        self.setState({pageConfig: res.data});
      })
      .catch(function (x) {
        console.log('Error attempting to retrieve employees.');
      });
  },

  get: function (payload) {
    var self = this;

    return axios.get(this.url(payload.action.employee._id))
      .then(function (res) {
        self.setState({employee: res.data});
        return true;
      })
      .catch(function (data) {
        console.log('There was an error getting the employee');
      });
  },

  update: function (payload) {
    var self = this;
    var employee = payload.action.employee;

    return axios.put(this.url(employee._id), employee)
      .then(function (res) {
        self.setState({employee: res.data});
        console.log('Employee : ' + employee.username + ', updated.');
      })
      .catch(function (x) {
        console.log('There was an error updating employee.');
      });
  },

  remove: function (payload) {
    var self = this;
    var employee = payload.action.employee;
    employee.deleted = true;

    return axios.put(this.url(employee._id), employee)
      .then(function (res) {
        self.setState({employee: res.data});
        console.log('Employee : ' + res.data.username + ', was deleted.');
        return true;
      })
      .catch(function (x) {
        console.log('Error attempting to delete employee.');
      });
  },

  restore: function (payload) {
    var self = this;
    var employee = payload.action.employee;
    employee.deleted = false;

    return axios.put(this.url(employee._id), employee)
      .then(function (res) {
        self.setState({employee: res.data});
        console.log('Employee : ' + res.data.username + ', was restored.');
        return true;
      })
      .catch(function (x) {
        console.log('Error attempting to restore employee.');
      });
  },

  create: function (payload) {
    var self = this;

    return axios.post(this.url(), payload.action.employee)
      .then(function (res) {
        self.setState({employee: res.data});
        console.log('Employee : ' + res.data.username + ', created.');
      })
      .catch(function (x) {
        console.log('There was an error creating employee.');
      });
  }
```


&nbsp;
### Create the Store

components/employees.js

** Notice the event handlers in the jsx

```javascript

  store: EmployeeStore,

  requestEmployees: EmployeeActions.list,

  getInitialState: function () {
    return this.store.getState();
  },

  onChange: function () {
    this.setState(this.store.getState());
  },

  componentWillMount: function () {
    this.requestEmployees({page: 1});
    this.store.addChangeListener(this.onChange);
  },

  componentWillUnmount: function () {
    this.store.removeChangeListener(this.onChange);
  },

  onPageChange: function (page) {
    this.requestEmployees({page: page});
  },

```


&nbsp;
### Communicate with the EmployeeStore via EmployeeActions

components/employee.row.js
```javascript

EmployeeActions.remove(this.props.employee);

EmployeeActions.restore(this.props.employee);
```

components/employee.row.spec.js

** uncomment the spies already written

```javascript
it('should fire a remove employee action', function () {
  expect(spies.remove).to.have.been.calledWith(employee);
});

it('should fire a restore employee action', function () {
  expect(spies.restore).to.have.been.calledWith(employee);
});
```


&nbsp;
## Run the application and see your work.

- In a terminal windows run: `gulp watch:dev` to fire off the build.
- In a separate terminal run: `gulp serve:dev` to serve the index.html.
- Navigate to [http://localhost:3000](http://localhost:3000) in your favorite browser.

- Click around and enjoy the result of your hard work during this lab.

![](img/lab03/first.page.png)

&nbsp;
### Commit your changes to Git and get ready for the next lab.

```
git add .
git commit -m 'We added some routes'
```
