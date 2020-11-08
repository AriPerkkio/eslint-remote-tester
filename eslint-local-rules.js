/**
 * This file is for integration tests only
 */

'use strict';

module.exports = {
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
};
