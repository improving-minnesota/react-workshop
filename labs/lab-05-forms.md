# Lab Five - Forms and Validation

## Checkout the Lab Branch
- In a terminal:

```
git checkout lab-05-forms-start
git pull
```

&nbsp;
### Check it out!

Mixins have been added..

Server team has added security

&nbsp;
### Create our Dispatcher
Routes

routes.jsx
```javascript
<Route name='login' path='/login' handler={Login} />

<Route name='app' path="/" handler={App}>

  <Route name='projects'          path='/projects'              handler={Projects} />
  <Route name='projects.detail'   path='/projects/detail/:_id'  handler={ProjectsDetail} />
  <Route name='projects.create'   path='/projects/create'       handler={ProjectsCreate} />

  <Route name='employees'         path='/employees'             handler={Employees} />
  <Route name='employees.detail'  path='/employees/detail/:_id' handler={EmployeesDetail} />
  <Route name='employees.create'  path='/employees/create'      handler={EmployeesCreate} />

  <Route name='timesheets'        path='/employees/:user_id/timesheets'             handler={Timesheets} />
  <Route name='timesheets.create' path='/employees/:user_id/timesheets/create'      handler={TimesheetsCreate} />
  <Route name='timesheets.detail' path='/employees/:user_id/timesheets/detail/:_id' handler={TimesheetsDetail} />

  <Route name='timesheets.detail.timeunits.create' path='/employees/:user_id/timesheets/detail/:_id/timeunits/create'            handler={TimeunitsCreate} />
  <Route name='timesheets.detail.timeunits.detail'   path='/employees/:user_id/timesheets/detail/:_id/timeunits/edit/:timeunit_id' handler={TimeunitsEdit} />

  <Redirect to="employees" />
</Route>
```

&nbsp;
### Create our Dispatcher
Login

Checkout LoginStore and LoginActions (current())

main.jsx
```javascript
// Attempt to get a current user session
LoginStore.current()
  .then(function () {

    // initialize the router and its routes
    Router.run(routes, function (Handler) {
      React.render(<Handler />, document.getElementById('app'));
    });
  });
```

components/app.jsx
```javascript
statics: {
  willTransitionTo: function (transition, params) {
    return LoginStore.requireAuthenticatedUser(transition);
  }
},
```

components/app.spec.js
```javascript
describe('during the will transition to lifecyle', function () {
  it('should require an authenticated user from the login store', function () {
    App.willTransitionTo('transitionArg', 'paramsArg');
    expect(proxies['../stores/login.store'].requireAuthenticatedUser).to.have.been.calledWith('transitionArg');
  });
});
```


components/login/login.jsx
```javascript
store: LoginStore,

getInitialState: function () {
  return this.store.getState();
},

onChange: function () {
  this.setState(this.store.getState());
},

componentWillMount: function () {
  this.store.addChangeListener(this.onChange);
},

componentWillUnmount: function () {
  this.store.removeChangeListener(this.onChange);
},

validate: function (event) {
  this.state.credentials[event.target.name] = event.target.value;
  this.setState(this.state.credentials);
},

handleSubmit: function (event) {
  event.preventDefault();
  LoginActions.login(this.state.credentials);
},

render: function () {
  return (
    <div className="ui padded page grid">
      <div className="two column centered row">
        <div className="left aligned column">
          <h4>Welcome to Timesheetz</h4>
        </div>
        <div className="right aligned column">
          <h5>Please Login</h5>
        </div>
      </div>

      <hr/>

      <div className="centered row">
        <div className="center aligned eight wide column">
          <form className="ui form" name="loginForm" onSubmit={this.handleSubmit}>
            <div className="inline field">
              <label htmlFor="login">Username</label>
              <input type="text"
                name="username" ref="login"
                value={this.state.credentials.username}
                onChange={this.validate} required />
            </div>
            <div className="inline field">
              <label htmlFor="pass">Password</label>
              <input type="password"
                name="password" ref="password"
                value={this.state.credentials.password}
                onChange={this.validate} required />
            </div>
            <div className="ui right aligned column">
              <button className="ui primary login button">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

&nbsp;
### Create our Dispatcher
Employees

components/employees.form.jsx
```javascript
  propTypes: {
    employee:   React.PropTypes.object,
    errors:     React.PropTypes.object,
    validate:   React.PropTypes.func.isRequired,
    hasErrors:  React.PropTypes.func.isRequired,
    toggleAdmin: React.PropTypes.func,
    onSave: React.PropTypes.func.isRequired
  },

  mixins: [
    Router.Navigation
  ],

  onCancel: function (event) {
    event.preventDefault();
    this.transitionTo('employees');
  },

  render : function () {
    return (
      <div className="ui ten column centered grid">
        <div className="ten wide column">
          <form className="ui inline form" name="employeeForm" onSubmit={this.props.onSave}>

            <TextInput name="username"
              label="Username"
              placeholder="Employee Username"
              value={this.props.employee.username}
              error={this.props.errors.username}
              onChange={this.props.validate} />

            <TextInput name="email"
              label="Email"
              placeholder="Employee Email"
              value={this.props.employee.email}
              error={this.props.errors.email}
              onChange={this.props.validate} />

            <TextInput name="firstName"
              label="First Name"
              placeholder="First Name"
              value={this.props.employee.firstName}
              error={this.props.errors.firstName}
              onChange={this.props.validate} />

            <TextInput name="lastName"
              label="Last Name"
              placeholder="Last Name"
              value={this.props.employee.lastName}
              error={this.props.errors.lastName}
              onChange={this.props.validate} />

            <Checkbox name="admin"
              label="Admin"
              value={this.props.employee.admin}
              onClick={this.props.toggleAdmin}
              onChange={this.props.validate} />

            <div className="ui horizontal divider"></div>

            <div className="ui sixteen column right floated grid">
              <SaveButton validateAll={this.props.validateAll} hasErrors={this.props.hasErrors()} saveText={this.props.saveText} />
              <CancelButton onCancel={this.onCancel} />
            </div>
          </form>
        </div>
      </div>
    );
  }
```

components/employees.form.spec.js
```javascript
describe('clicking the cancel button', function () {
  it('should go back to the employees home', function () {
    var cancel = TestUtils.findRenderedComponentWithType(element, CancelButton);
    var button = TestUtils.findRenderedDOMComponentWithTag(cancel, 'button');
    TestUtils.Simulate.click(button);

    expect(spies.transitionTo).to.have.been.calledWith('employees');
  });
});
```


components/employees.create.jsx
```javascript
mixins : [
  Router.Navigation,
  Router.State,
  EmployeeMixin
],

onChange: function () {
  this.setState(this.store.getState());
},

componentWillMount: function () {
  this.store.addChangeListener(this.onChange);
},

componentWillUnmount: function () {
  this.store.removeChangeListener(this.onChange);
},

getInitialState: function () {
  return {
    saveText: 'Create',
    employee: {
      admin:false
    },
    errors: {}
  };
},

saveEmployee: function (event) {
  event.preventDefault();
  this.validateAll();

  if (!this.hasErrors()) {
    EmployeeActions.create(this.state.employee);
    this.transitionTo('employees');
  }
},

render : function () {
  return (
    <EmployeeForm employee={this.state.employee}
      errors={this.state.errors}
      validateAll={this.validateAll}
      hasErrors={this.hasErrors}
      saveText={this.state.saveText}
      onSave={this.saveEmployee}
      validate={this.validate}
      toggleAdmin={this.toggleAdmin} />
  );
}
```

components/employees.create.spec.js

**** uncomment the spies ****

```javascript
describe('saving an employee', function () {
  beforeEach(function () {
    element.saveEmployee({preventDefault: _.noop});
  });

  it('should validate the entire employee', function () {
    expect(spies.validateAll).to.have.been.called;
  });

  describe('when the employee passes validation', function () {
    beforeEach(function () {
      spies.hasErrors = sinon.stub(element, 'hasErrors').returns(false);
    });

    afterEach(function () {
      spies.hasErrors.restore();
    });

    it('should fire a create action', function () {
      expect(spies.create).to.have.been.called;
    });

    it('should transition back to the employee list', function () {
      expect(spies.transitionTo).to.have.been.calledWith('employees');
    });
  });
});
```
components/employees.jsx
```javascript
<div className="row">
  <button className="ui right floated primary button pad-bottom" type="button" onClick={this.createNew}>
    New Employee
  </button>
</div>

  createNew: function createNew () {
    this.transitionTo('employees.create');
  },
```

components/employees.spec.js
```javascript
describe('clicking the new employee button', function () {
  it('should transition to the create employee route', function () {
    var button = TestUtils.findRenderedDOMComponentWithTag(element, 'button');
    TestUtils.Simulate.click(button);
    expect(spies.transitionTo).to.have.been.calledWith('employees.create');
  });
});
```

components/employee.detail.jsx
```javascript
mixins: [
  Router.Navigation,
  Router.State,
  EmployeeMixin
],

saveEmployee: function (event) {
  event.preventDefault();
  this.validateAll();

  if (!this.hasErrors()) {
    EmployeeActions.update(this.state.employee);
    this.transitionTo('employees');
  }
},

get: function () {
  var employee = this.store.getState().employee;
  if (_.isEmpty(employee)) {
    var employeeId = this.getParams()._id;
    EmployeeActions.get(employeeId);
  }
  else {
    this.onChange();
  }
},

getInitialState: function () {
  return {
    saveText: 'Update',
    employee: {},
    errors: {}
  };
},

onChange: function () {
  this.setState(this.store.getState());
},

componentWillMount: function () {
  this.store.addChangeListener(this.onChange);
},

componentWillUnmount: function () {
  this.store.removeChangeListener(this.onChange);
},

componentDidMount: function () {
  this.get();
},

render : function () {
  return (
    <EmployeeForm employee={this.state.employee}
      errors={this.state.errors}
      validateAll={this.validateAll}
      hasErrors={this.hasErrors}
      saveText={this.state.saveText}
      onSave={this.saveEmployee}
      validate={this.validate}
      toggleAdmin={this.toggleAdmin} />
  );
}
```

components/employee.detail.spec.js
```javascript
describe('getting the employee', function () {
  describe('and the employee exists on the store state', function () {
    beforeEach(function () {
      element.store.state.employee = {_id: 'abc123'};
      element.get();
    });

    it('should set the employee on the component state', function () {
      expect(element.state.employee._id).to.equal('abc123');
    });
  });

  describe('and the employee does NOT exist in the stored state', function () {
    beforeEach(function () {
      element.get();
    });

    it('should fire a get employee action', function () {
      expect(proxies['../../actions/employee.actions'].get).to.have.been.calledWith('abc123');
    });
  });
});

describe('saving an employee', function () {
  beforeEach(function () {
    element.saveEmployee({preventDefault: _.noop});
  });

  it('should validate the entire employee', function () {
    expect(spies.validateAll).to.have.been.called;
  });

  describe('and the employee passes validation', function () {
    beforeEach(function () {
      spies.hasErrors = sinon.stub(element, 'hasErrors').returns(false);
    });

    afterEach(function () {
      spies.hasErrors.restore();
    });

    it('should fire an update action', function () {
      expect(proxies['../../actions/employee.actions'].update).to.have.been.called;
    });

    it('should transition back to the employee list', function () {
      expect(spies.transitionTo).to.have.been.calledWith('employees');
    });
  });
});
```

components/employees/employee.row.jsx
```javascript
showDetail: function showDetail () {
  var employee = this.props.employee;
  if (employee.deleted) {
    SnackbarActions.error('You cannot edit a deleted employee.');
    return;
  }
  this.props.store.setState({employee: employee});
  this.transitionTo('employees.detail', {_id: employee._id});
},

<tr className={classNames} ref={employee._id} onClick={this.showDetail}>
```

components/employees/employee.row.spec.js
```javascript
describe('clicking the row', function () {
  describe('when the employee is deleted', function () {
    beforeEach(function () {
      employee = {
        _id: 'abc123',
        deleted: true
      };

      spies.error = sinon.stub(SnackbarActions, 'error');

      element = TestUtils.renderIntoDocument(<EmployeeRow employee={employee} store={EmployeeStore} />);
      element.showDetail();
    });

    afterEach(function () {
      spies.error.restore();
    });

    it('should display an error in the snackbar', function () {
      expect(spies.error).to.have.been.calledWith('You cannot edit a deleted employee.');
    });
  });

  describe('when the employee is NOT deleted', function () {
    beforeEach(function () {
      employee = {
        _id: 'abc123',
        username: 'sterlingArcher',
        deleted: false
      };

      element = TestUtils.renderIntoDocument(<EmployeeRow employee={employee} store={EmployeeStore} />);
      spies.transitionTo = sinon.stub(element, 'transitionTo');
      element.showDetail();
    });

    afterEach(function () {
      spies.transitionTo.restore();
    });

    it('should set the employee on the stored state', function () {
      expect(element.props.store.getState().employee.username).to.equal('sterlingArcher');
    });

    it('should transition to the detail route', function () {
      expect(spies.transitionTo).to.have.been.calledWith('employees.detail', {_id: 'abc123'});
    });
  });
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
