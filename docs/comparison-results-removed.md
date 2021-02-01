# Removed:

## Rule: id-length

-   Message: `Identifier name 's' is too short (< 2).`
-   Path: `AriPerkkio/js-framework-playground/packages/react/src/components/LoadButton.jsx`
-   [Link](https://github.com/AriPerkkio/js-framework-playground/blob/HEAD/packages/react/src/components/LoadButton.jsx#L4-L4)

```jsx
  2 |
  3 | const LoadButton = ({ onUserLoad }) => {
> 4 |     const [userIndex, increaseUserIndex] = useReducer(s => s + 1, 1);
    |                                                       ^
  5 |     const [disabled, toggleDisabled] = useReducer(s => !s, false);
  6 |
  7 |     const onClick = () => {
```

## Rule: id-length

-   Message: `Identifier name 's' is too short (< 2).`
-   Path: `AriPerkkio/js-framework-playground/packages/react/src/components/LoadButton.jsx`
-   [Link](https://github.com/AriPerkkio/js-framework-playground/blob/HEAD/packages/react/src/components/LoadButton.jsx#L5-L5)

```jsx
  3 | const LoadButton = ({ onUserLoad }) => {
  4 |     const [userIndex, increaseUserIndex] = useReducer(s => s + 1, 1);
> 5 |     const [disabled, toggleDisabled] = useReducer(s => !s, false);
    |                                                   ^
  6 |
  7 |     const onClick = () => {
  8 |         toggleDisabled();
```

## Rule: id-length

-   Message: `Identifier name 'h' is too short (< 2).`
-   Path: `AriPerkkio/js-framework-playground/packages/vue/src/main.js`
-   [Link](https://github.com/AriPerkkio/js-framework-playground/blob/HEAD/packages/vue/src/main.js#L7-L7)

```js
  5 |
  6 | new Vue({
> 7 |   render: h => h(App),
    |           ^
  8 | }).$mount('#app')
  9 |
```

## Rule: id-length

-   Message: `Identifier name 'a' is too short (< 2).`
-   Path: `oldboyxx/jira_clone/client/src/Project/Board/Lists/List/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/Project/Board/Lists/List/index.jsx#L72-L72)

```jsx
  70 |
  71 | const getSortedListIssues = (issues, status) =>
> 72 |   issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);
     |                                                         ^
  73 |
  74 | const formatIssuesCount = (allListIssues, filteredListIssues) => {
  75 |   if (allListIssues.length !== filteredListIssues.length) {
```

## Rule: id-length

-   Message: `Identifier name 'b' is too short (< 2).`
-   Path: `oldboyxx/jira_clone/client/src/Project/Board/Lists/List/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/Project/Board/Lists/List/index.jsx#L72-L72)

```jsx
  70 |
  71 | const getSortedListIssues = (issues, status) =>
> 72 |   issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);
     |                                                            ^
  73 |
  74 | const formatIssuesCount = (allListIssues, filteredListIssues) => {
  75 |   if (allListIssues.length !== filteredListIssues.length) {
```

## Rule: id-length

-   Message: `Identifier name 'a' is too short (< 2).`
-   Path: `oldboyxx/jira_clone/client/src/Project/Board/Lists/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/Project/Board/Lists/index.jsx#L93-L93)

```jsx
  91 |
  92 | const getSortedListIssues = (issues, status) =>
> 93 |   issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);
     |                                                         ^
  94 |
  95 | ProjectBoardLists.propTypes = propTypes;
  96 |
```

## Rule: id-length

-   Message: `Identifier name 'b' is too short (< 2).`
-   Path: `oldboyxx/jira_clone/client/src/Project/Board/Lists/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/Project/Board/Lists/index.jsx#L93-L93)

```jsx
  91 |
  92 | const getSortedListIssues = (issues, status) =>
> 93 |   issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);
     |                                                            ^
  94 |
  95 | ProjectBoardLists.propTypes = propTypes;
  96 |
```
