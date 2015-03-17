# Lab Three - Adding Routing and Components Composition

## Checkout the Lab Branch
- In a terminal:

```
git checkout lab-03-routing-start
git pull
```
&nbsp;
### Check it out!

- Before doing anything, let's look at the progress that has already been completed by the team on the application.
  - Peruse the **client/src/components** directory and notice that the **Projects** and **Timesheets** modules have been implemented by the team.
  - You will be building out the **Employees** module and adding a **Navbar** to the app to enable navigation.
  - The module files have been stubbed out for you, we just need to add the codez.

&nbsp;
## Create our Application's Routes

- Open **client/src/routes.jsx**
- Let's start by importing the component classes that we are going to use as our **Handlers** for our routes:

```javascript
var App = require('./components/app');

var Projects = require('./components/projects/projects');
var Employees = require('./components/employees/employees');
var Timesheets = require('./components/timesheets/timesheets');
```

- Next let's configure our routes:
  - We need a container route `app` to contain our application skeleton.
  - We need separate sibling routes for **Projects**, **Employees**, and **Timesheets** to populate the `<RouteHandler />` inside the **App** component.
  - Even though **Timesheets** content is a sibling to **Employees**, we want the route to behave as if it is a child so that we have access to the `user_id` from the route's params.
  - If we can't match the route entered, we want to redirect the user to the **Employees** component.

> Note: You will notice below that we are exporting `JSX` which is wrapped in parens `()`, not curlies `{}`.

```javascript
module.exports = (
  <Route name='app' path="/" handler={App}>

    <Route name='projects'   path='/projects'  handler={Projects} />
    <Route name='employees'  path='/employees' handler={Employees} />
    <Route name='timesheets' path='/employees/:user_id/timesheets' handler={Timesheets} />

    <Redirect to="employees" />
  </Route>
);
```

&nbsp;
## Add the Navbar to our Application

- Open **client/src/components/common/navigation/navbar.jsx**

- We first need to mixin the extra functionality that we want our component to have. We do this by adding the array to the **mixins** property:
  - **Router.State** gives us the `getRoutes()` method which we will use to set the active class on the correct navbar link.
  - **classes** mixin gives us a helper method, `getClass()`, to make manipulating `className` in our `render()` method a bit less painful.

- Add the mixins to the **Navbar** component definition:  

```javascript
  mixins: [
    Router.State,
    classes
  ],
```
- Now we can implement our `render()` method:
  - We first do a little lodash gymnastics to determine if our current route matches any of the routes registered in **routes.js**.
    - If there is a match, we add the **active** class to the corresponding **Link**.

  - We use **react-router**'s **Link** component to attach our navbar's buttons to the router's routes.
    - Notice for the Timesheet's Link, we are adding an extra prop, **params** so that the user's ID is reflected in the application's url.


```javascript
render : function () {
  var activeRoutes = _.pluck(this.getRoutes(), 'name').join('.').split('.');

  var projectsClasses = this.getClass('item', {
    active: _.contains(activeRoutes, 'projects')
  });

  var employeesClasses = this.getClass('item', {
    active: _.contains(activeRoutes, 'employees')
  });

  var timesheetsClasses = this.getClass('item', {
    active: _.contains(activeRoutes, 'timesheets')
  });

  return (
    <div className="ui fixed menu fluid">
      <a className="header item" href="#">
        <i className="fa fa-clock-o fa-lg"/> {this.state.title}
      </a>

      <Link className={projectsClasses} to="projects">Projects</Link>
      <Link className={employeesClasses} to="employees">Employees</Link>
      <Link className={timesheetsClasses} to="timesheets" params={{user_id: this.state.user._id}}>Timesheets</Link>

    </div>
  );
}
```

- Now all we need is to set up some initial state to be used within the `render()` method we just implemented:

```javascript
getInitialState: function () {
  return {
    title: 'Timesheetz',
    user: {_id: 'all'}
  };
},
```

&nbsp;
## Test the Navbar

- Just like in lab 2, we need to test that our component will render without errors.
- Open **client/src/components/common/navigation/navbar.spec.js** and add the setup and test.

&nbsp;
#### What's different?
  - You'll notice that we are using **proxyquire** to mock our our component imports for **react-router**. This is because we don't want the router to actually change routes in our browser during tests.
  - We are also using a very simple `mockComponent()` that you can find in **src/components/mock.jsx**. It just returns a plain `div`.
  - Finally, we are using **sinon** to stub the `getRoutes()` method so that we can control what it returns and track when it has been called.

- Add the below code to the **navbar.spec.js**

```javascript
beforeEach(function () {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;
});

beforeEach(function () {
  proxies = {
    'react-router': {
      RouteHandler: mockComponent('RouteHandler'),
      Link: mockComponent('Link'),
      State: {
        getRoutes: sinon.stub().returns([{name: 'projects'}])
      }
    },
    '@noCallThru': true
  };

  Navbar = proxyquire('./navbar', proxies);
  element = TestUtils.renderIntoDocument(<Navbar />);
});

it('should instantiate the Navbar', function () {
  expect(TestUtils.isCompositeComponent(element)).to.be.true;
});
```

&nbsp;
## Run the tests

- Run `gulp test` in the terminal you have set aside for testing and verify that the test passes.
  - Since there are already a bunch of tests implemented, you may have to do a little searching in the report to find the one you just wrote.

&nbsp;
## Test the active class gets set correctly on the Link

- Now that we can verify that the component can be compiled, let's test that the `active` class gets set on the appropriate `Link`.
- Add the below test right under the previous test.

> Note: With Mocha (and other test suites) you can nest **describe** blocks within each other to make your test descriptions more specific.

```javascript
describe('when navigating between routes', function () {
  it('should set the appropriate active class', function () {

    // find all of the Links that are rendered inside of the element
    var Links = TestUtils.scryRenderedComponentsWithType(element, proxies['react-router'].Link);

    // find the item with the active class
    var projectLink = TestUtils.findRenderedDOMComponentWithClass(element, 'active');

    // make sure that it is the projects link
    expect(projectLink.getDOMNode().innerText).to.equal('Projects');
  });
});
```

- Run the tests (or look at them if they are still running). Did your new one pass?
- Note that we use the `getDOMNode()` method on the component to get its vanilla DOM object from the browser.

> Yeah, I know. We didn't even use the line of code that found all of the **Links** rendered within **element**, but I thought it would be cool to demonstrate that method. Try adding a breakpoint and stepping through your test in Chrome Dev Tools and inspect each object.

&nbsp;
## Implement the Application's container

- Now that we have our routes configured and a navbar to navigate between the routes, we need a container to provide a home for the navbar and the entry point for the route handlers.

- Open **src/client/components/app.jsx**
- Implement the `render()` method:

```javascript
render : function () {
  return (
    <div>
      <NavBar />
      <div className="container">
        <SectionHeader />
        <div className="row">
          <RouteHandler />
        </div>
      </div>
    </div>
  );
}
```

- And test the render method:

- Open **client/src/components/app.spec.js**

```javascript
beforeEach(function () {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;
});

beforeEach(function () {
  proxies = {
    './common/navigation/navbar': mockComponent('Navbar'),
    './common/section': mockComponent('SectionHeader'),
    'react-router': {
      RouteHandler: mockComponent('RouteHandler')
    }
  };

  App = proxyquire('./app', proxies);
  element = TestUtils.renderIntoDocument(<App />);
});

it('should instantiate the App', function () {
  expect(TestUtils.isCompositeComponent(element)).to.be.true;
});
```

&nbsp;
## Boostrap the Router

- Now all we have to do is wrap our `React.render()` method within the callback for the `Router.run()` method to boostrap the application and hand the control over to the **React Router**.
- Open our application entry point: **client/src/main.jsx**
-

```javascript
Router.run(routes, function (Handler) {
  React.render(<Handler />, document.getElementById('app'));
});
```

&nbsp;
## Run the application and see your work.

- In a terminal window run: `gulp watch:dev` to fire off the build.
- In a separate terminal run: `gulp serve:dev` to serve the index.html.
- Navigate to [http://localhost:3000](http://localhost:3000) in your favorite browser.
- You should be able to click around the navbar and have the routes change revealing each handler.
  - I'm sure it worked fine for **Timesheets** and **Projects**, but we still need to implement **Employees**.

&nbsp;
## Composing React Components

- Now that we fully functional routing between our three sections of the application, we need to finish the **Employee** module.

- We want to display the list of employees when the user clicks the employee link in the navbar.
- To do this, we need to build three components:
  - The *Employees* route handler that acts as our controller component.
  - The *EmployeeTable* component to contain our list of employees.
  - The *EmployeeRow* component that is repeated within our *EmployeeTable* component for each employee.

&nbsp;
## Create the EmployeeRow Component

- Open **client/src/components/employees/employee.row.jsx**
- We need to create a component that accepts an employee property that is an object.
- We will expose a reference (ref) to the row via that employee's `_id` property.
- The row should contain `<td/>`'s for each of the employee's properties.


```javascript
propTypes: {
  employee: React.PropTypes.object
},

render: function () {
  var employee = this.props.employee;

  return (
    <tr className={classNames} ref={employee._id}>
      <td>{employee.username}</td>
      <td>{employee.email}</td>
      <td>{employee.firstName}</td>
      <td>{employee.lastName}</td>
      <td>{employee.admin ? 'Yes' : 'No'}</td>
    </tr>
  );
}
```

- We can then test that our component renders correctly:
- Open **client/src/components/employees/employee.row.spec.js** and add the below tests.
  - Feel free to add actual properties to the employee object and test for thier existence in a `<td/>`.

```javascript
beforeEach(function () {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;
});

beforeEach(function () {
  EmployeeRow = require('./employee.row');
});

it('should instantiate the EmployeeRow', function () {
  element = TestUtils.renderIntoDocument(<EmployeeRow employee={{_id: 1}} />);
  expect(TestUtils.isCompositeComponent(element)).to.be.true;
});
```

## Create the EmployeesTable Component

- Our next move is to create the table that will contain our **EmployeeRow**s.
- Open **client/src/components/employees/employee.table.jsx**

- We need to declare that the **employees** property should be an array of object and that it is required.

```javascript
propTypes: {
  employees: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
},
```

- Now we need to implement our `render()` method in order to:
  - Iterate through the list of employees and instantiate a new **EmployeeRow** for each.
  - Collect all of the rows into a variable and put them into our table JSX.

> Remember JSX is just Javascript when it compiles so you can pass it to other JSX to include it in our component's DOM.

```javascript
render: function () {
  var key = 1;

  var employeeRows = this.props.employees.map(function (employee) {
    employee.id = key;

    return (
      <EmployeeRow employee={employee} key={++key} />
    );
  });

  return (
    <table className="ui celled table tsz-table-row-cursor">
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Admin</th>
        </tr>
      </thead>
      <tbody>
        {employeeRows}
      </tbody>
    </table>
  );
}
```

- Now let's test that our employee table renders correctly.
- Can you write a test to check the number of **EmployeeRows** added to our table?

components/employees/employee.table.spec.js
```javascript
beforeEach(function () {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;
});

beforeEach(function () {
  employees = [{}, {}];

  EmployeeTable = require('./employee.table');
  element = TestUtils.renderIntoDocument(
    <EmployeeTable employees={employees} />
  );
});

it('should instantiate the EmployeeTable', function () {
  expect(TestUtils.isCompositeComponent(element)).to.be.true;
});
```

&nbsp;
## Create Employees Component

- Lastly, we need to add the table to our handler for the `/employees` route.
- Open **client/src/components/employees/employees.jsx**

> The component's `getInitialState()` has been implemented for you so that you'll have mock data.

```javascript
render: function () {
  return (
    <div>
      <div className="row">
        <EmployeeTable employees={this.state.pageConfig.data} />
      </div>
    </div>
  );
}
```

- Open **client/src/components/employees/employees.spec.js**
- Test that our component renders as expected.

```javascript
beforeEach(function () {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;
});

beforeEach(function () {
  Employees = require('./employees');
  element = TestUtils.renderIntoDocument(<Employees />);
});

it('should instantiate the Employees', function () {
  expect(TestUtils.isCompositeComponent(element)).to.be.true;
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
