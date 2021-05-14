const clone = jest.fn();
const pull = jest.fn();

export default function SimpleGit(): {
    clone: typeof clone;
    pull: typeof pull;
} {
    return { clone, pull };
}
