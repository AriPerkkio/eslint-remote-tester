# Added:

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'onClick'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/Button/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/Button/index.jsx#L28-L28)

```jsx
  26 |   disabled: false,
  27 |   isWorking: false,
> 28 |   onClick: () => {},
     |                  ^^
  29 | };
  30 |
  31 | const Button = forwardRef(
```

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'onChange'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/Input/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/Input/index.jsx#L21-L21)

```jsx
  19 |   invalid: false,
  20 |   filter: undefined,
> 21 |   onChange: () => {},
     |                   ^^
  22 | };
  23 |
  24 | const Input = forwardRef(({ icon, className, filter, onChange, ...inputProps }, ref) => {
```

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'onClose'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/Modal/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/Modal/index.jsx#L29-L29)

```jsx
  27 |   withCloseIcon: true,
  28 |   isOpen: undefined,
> 29 |   onClose: () => {},
     |                  ^^
  30 |   renderLink: () => {},
  31 | };
  32 |
```

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'renderLink'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/Modal/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/Modal/index.jsx#L30-L30)

```jsx
  28 |   isOpen: undefined,
  29 |   onClose: () => {},
> 30 |   renderLink: () => {},
     |                     ^^
  31 | };
  32 |
  33 | const Modal = ({
```

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'onChange'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/TextEditor/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/TextEditor/index.jsx#L22-L22)

```jsx
  20 |   defaultValue: undefined,
  21 |   value: undefined,
> 22 |   onChange: () => {},
     |                   ^^
  23 |   getEditor: () => {},
  24 | };
  25 |
```

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'getEditor'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/TextEditor/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/TextEditor/index.jsx#L23-L23)

```jsx
  21 |   value: undefined,
  22 |   onChange: () => {},
> 23 |   getEditor: () => {},
     |                    ^^
  24 | };
  25 |
  26 | const TextEditor = ({
```
