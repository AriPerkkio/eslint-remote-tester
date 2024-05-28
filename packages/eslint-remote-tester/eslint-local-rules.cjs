/**
 * This file is for tests only
 */

'use strict';

module.exports = {
    // Integration tests
    'some-unstable-rule': {
        meta: {
            docs: {
                description: 'intentionally crash',
                category: 'Possible Errors',
                recommended: false,
            },
            schema: [],
        },
        create: function () {
            return {
                Identifier: function (node) {
                    if (node.name === 'attributeForCrashing') {
                        node.name.attributeForCrashing.someAttribute;
                    }
                },
            };
        },
    },
    // Smoke tests
    ...['verbose-rule', 'verbose-rule-2'].reduce(
        (rules, ruleName) => ({
            ...rules,
            [ruleName]: {
                meta: {
                    docs: {
                        description: 'Produce 500Mb eslint results',
                        category: 'Possible Errors',
                        recommended: false,
                    },
                    schema: [],
                },
                create: function (context) {
                    const COUNT = 4000;
                    const items = Array(COUNT)
                        .fill(null)
                        .map((_, i) => i);

                    return {
                        Identifier: function (node) {
                            for (const i of items) {
                                context.report({
                                    node,
                                    message: `Lorem ipsum ${i}`.repeat(1000),
                                });
                            }
                        },
                    };
                },
            },
        }),
        {}
    ),
};
