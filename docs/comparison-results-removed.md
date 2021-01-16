# Removed:

## Rule: id-length

-   Message: `Identifier name 's' is too short (< 2).`
-   Path: `AriPerkkio/js-framework-playground/packages/react/src/components/LoadButton.jsx`
-   [Link](https://github.com/AriPerkkio/js-framework-playground/blob/HEAD/packages/react/src/components/LoadButton.jsx#L4-L4)

```jsx
import React, { useReducer } from 'react';

const LoadButton = ({ onUserLoad }) => {
    const [userIndex, increaseUserIndex] = useReducer(s => s + 1, 1);
    const [disabled, toggleDisabled] = useReducer(s => !s, false);

    const onClick = () => {
        toggleDisabled();
        increaseUserIndex();
```

## Rule: id-length

-   Message: `Identifier name 's' is too short (< 2).`
-   Path: `AriPerkkio/js-framework-playground/packages/react/src/components/LoadButton.jsx`
-   [Link](https://github.com/AriPerkkio/js-framework-playground/blob/HEAD/packages/react/src/components/LoadButton.jsx#L5-L5)

```jsx
import React, { useReducer } from 'react';

const LoadButton = ({ onUserLoad }) => {
    const [userIndex, increaseUserIndex] = useReducer(s => s + 1, 1);
    const [disabled, toggleDisabled] = useReducer(s => !s, false);

    const onClick = () => {
        toggleDisabled();
        increaseUserIndex();

```

## Rule: id-length

-   Message: `Identifier name 'h' is too short (< 2).`
-   Path: `AriPerkkio/js-framework-playground/packages/vue/src/main.js`
-   [Link](https://github.com/AriPerkkio/js-framework-playground/blob/HEAD/packages/vue/src/main.js#L7-L7)

```js
Vue.config.productionTip = false;

new Vue({
    render: h => h(App),
}).$mount('#app');
```

## Rule: id-length

-   Message: `Identifier name 'a' is too short (< 2).`
-   Path: `oldboyxx/jira_clone/client/src/Project/Board/Lists/List/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/Project/Board/Lists/List/index.jsx#L72-L72)

```jsx
  return issues;
};

const getSortedListIssues = (issues, status) =>
  issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);

const formatIssuesCount = (allListIssues, filteredListIssues) => {
  if (allListIssues.length !== filteredListIssues.length) {
    return `${filteredListIssues.length} of ${allListIssues.length}`;
  }
```

## Rule: id-length

-   Message: `Identifier name 'b' is too short (< 2).`
-   Path: `oldboyxx/jira_clone/client/src/Project/Board/Lists/List/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/Project/Board/Lists/List/index.jsx#L72-L72)

```jsx
  return issues;
};

const getSortedListIssues = (issues, status) =>
  issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);

const formatIssuesCount = (allListIssues, filteredListIssues) => {
  if (allListIssues.length !== filteredListIssues.length) {
    return `${filteredListIssues.length} of ${allListIssues.length}`;
  }
```

## Rule: id-length

-   Message: `Identifier name 'a' is too short (< 2).`
-   Path: `oldboyxx/jira_clone/client/src/Project/Board/Lists/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/Project/Board/Lists/index.jsx#L93-L93)

```jsx
  };
};

const getSortedListIssues = (issues, status) =>
  issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);

ProjectBoardLists.propTypes = propTypes;

export default ProjectBoardLists;

```

## Rule: id-length

-   Message: `Identifier name 'b' is too short (< 2).`
-   Path: `oldboyxx/jira_clone/client/src/Project/Board/Lists/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/Project/Board/Lists/index.jsx#L93-L93)

```jsx
  };
};

const getSortedListIssues = (issues, status) =>
  issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);

ProjectBoardLists.propTypes = propTypes;

export default ProjectBoardLists;

```
