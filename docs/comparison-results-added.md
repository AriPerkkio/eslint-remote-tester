# Added:

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'onClick'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/Button/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/Button/index.jsx#L28-L28)

```jsx
  icon: undefined,
  iconSize: 18,
  disabled: false,
  isWorking: false,
  onClick: () => {},
};

const Button = forwardRef(
  ({ children, variant, icon, iconSize, disabled, isWorking, onClick, ...buttonProps }, ref) => {
    const handleClick = () => {
```

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'onChange'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/Input/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/Input/index.jsx#L21-L21)

```jsx
  value: undefined,
  icon: undefined,
  invalid: false,
  filter: undefined,
  onChange: () => {},
};

const Input = forwardRef(({ icon, className, filter, onChange, ...inputProps }, ref) => {
  const handleChange = event => {
    if (!filter || filter.test(event.target.value)) {
```

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'onClose'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/Modal/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/Modal/index.jsx#L29-L29)

```jsx
  variant: 'center',
  width: 600,
  withCloseIcon: true,
  isOpen: undefined,
  onClose: () => {},
  renderLink: () => {},
};

const Modal = ({
  className,
```

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'renderLink'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/Modal/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/Modal/index.jsx#L30-L30)

```jsx
  width: 600,
  withCloseIcon: true,
  isOpen: undefined,
  onClose: () => {},
  renderLink: () => {},
};

const Modal = ({
  className,
  testid,
```

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'onChange'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/TextEditor/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/TextEditor/index.jsx#L22-L22)

```jsx
  className: undefined,
  placeholder: undefined,
  defaultValue: undefined,
  value: undefined,
  onChange: () => {},
  getEditor: () => {},
};

const TextEditor = ({
  className,
```

## Rule: no-empty-function

-   Message: `Unexpected empty arrow function 'getEditor'.`
-   Path: `oldboyxx/jira_clone/client/src/shared/components/TextEditor/index.jsx`
-   [Link](https://github.com/oldboyxx/jira_clone/blob/HEAD/client/src/shared/components/TextEditor/index.jsx#L23-L23)

```jsx
  placeholder: undefined,
  defaultValue: undefined,
  value: undefined,
  onChange: () => {},
  getEditor: () => {},
};

const TextEditor = ({
  className,
  placeholder,
```
