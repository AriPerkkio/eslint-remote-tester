## Rule: react/no-unstable-nested-components

-   Message: `Declare this component outside parent component "NestedGrid" or memoize it.`
-   Path: `mui-org/material-ui/docs/src/pages/components/grid/NestedGrid.js`
-   [Link](https://github.com/mui-org/material-ui/blob/HEAD/docs/src/pages/components/grid/NestedGrid.js#L20-L34)

```js
  18 |   const classes = useStyles();
  19 |
> 20 |   function FormRow() {
     |   ^^^^^^^^^^^^^^^^^^^^
> 21 |     return (
     | ^^^^^^^^^^^^
> 22 |       <React.Fragment>
     | ^^^^^^^^^^^^
> 23 |         <Grid item xs={4}>
     | ^^^^^^^^^^^^
> 24 |           <Paper className={classes.paper}>item</Paper>
     | ^^^^^^^^^^^^
> 25 |         </Grid>
     | ^^^^^^^^^^^^
> 26 |         <Grid item xs={4}>
     | ^^^^^^^^^^^^
> 27 |           <Paper className={classes.paper}>item</Paper>
     | ^^^^^^^^^^^^
> 28 |         </Grid>
     | ^^^^^^^^^^^^
> 29 |         <Grid item xs={4}>
     | ^^^^^^^^^^^^
> 30 |           <Paper className={classes.paper}>item</Paper>
     | ^^^^^^^^^^^^
> 31 |         </Grid>
     | ^^^^^^^^^^^^
> 32 |       </React.Fragment>
     | ^^^^^^^^^^^^
> 33 |     );
     | ^^^^^^^^^^^^
> 34 |   }
     | ^^^^
  35 |
  36 |   return (
  37 |     <div className={classes.root}>
```

## Rule: jsx-no-constructed-context-values

-   Message: `Cannot read property 'set' of undefined Occurred while linting <text>:69`
-   Path: `mlaursen/react-md/packages/alert/src/MessageQueue.tsx`
-   [Link](https://github.com/mlaursen/react-md/blob/HEAD/packages/alert/src/MessageQueue.tsx#L69)

```tsx
  67 |
  68 |   return (
> 69 |     <AddMessageContext.Provider value={addMessage as AddMessage<Message>}>
  70 |       <MessageQueueActionsContext.Provider value={actions}>
  71 |         <MessageVisibilityContext.Provider value={visible}>
  72 |           <MessageQueueContext.Provider value={queue}>
```

```
TypeError: Cannot read property 'set' of undefined
Occurred while linting <text>:69
    at isConstruction (/<removed>/eslint-remote-tester/node_modules/eslint-plugin-react/lib/rules/jsx-no-constructed-context-values.js:25:41)
    at isConstruction (/<removed>/eslint-remote-tester/node_modules/eslint-plugin-react/lib/rules/jsx-no-constructed-context-values.js:113:14)
    at JSXOpeningElement (/<removed>/eslint-remote-tester/node_modules/eslint-plugin-react/lib/rules/jsx-no-constructed-context-values.js:179:31)
    at /<removed>/eslint-remote-tester/node_modules/eslint/lib/linter/safe-emitter.js:45:58
    at Array.forEach (<anonymous>)
    at Object.emit (/<removed>/eslint-remote-tester/node_modules/eslint/lib/linter/safe-emitter.js:45:38)
    at NodeEventGenerator.applySelector (/<removed>/eslint-remote-tester/node_modules/eslint/lib/linter/node-event-generator.js:254:26)
    at NodeEventGenerator.applySelectors (/<removed>/eslint-remote-tester/node_modules/eslint/lib/linter/node-event-generator.js:283:22)
    at NodeEventGenerator.enterNode (/<removed>/eslint-remote-tester/node_modules/eslint/lib/linter/node-event-generator.js:297:14)
    at CodePathAnalyzer.enterNode (/<removed>/eslint-remote-tester/node_modules/eslint/lib/linter/code-path-analysis/code-path-analyzer.js:711:23)
```

## Rule: react/jsx-handler-names

-   Message: `Handler function for onClick prop key must be a camelCase name beginning with 'handle' only`
-   Path: `mui-org/material-ui/docs/src/pages/components/menus/MenuPopupState.js`
-   [Link](https://github.com/mui-org/material-ui/blob/HEAD/docs/src/pages/components/menus/MenuPopupState.js#L17-L17)

```js
  15 |           <Menu {...bindMenu(popupState)}>
  16 |             <MenuItem onClick={popupState.close}>Cake</MenuItem>
> 17 |             <MenuItem onClick={popupState.close}>Death</MenuItem>
     |                       ^^^^^^^^^^^^^^^^^^^^^^^^^^
  18 |           </Menu>
  19 |         </React.Fragment>
  20 |       )}
```
