/**
 * @fileoverview Ensure symmetric naming of setState hook value and setter variables
 * @author Duncan Beevers
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/hook-use-state');
const parsers = require('../../helpers/parsers');

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});

const tests = {
  valid: parsers.all([
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [color, setColor] = useState()
          return [color, setColor]
        }
      `,
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [color, setColor] = useState('#ffffff')
          return [color, setColor]
        }
      `,
    },
    {
      code: `
        import React from 'react'
        function useColor() {
          const [color, setColor] = React.useState()
          return [color, setColor]
        }
      `,
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [color1, setColor1] = useState()
          return [color1, setColor1]
        }
      `,
    },
    {
      code: 'useState()',
    },
    {
      code: 'const result = useState()',
    },
    {
      code: 'const [color, setFlavor] = useState()',
    },
    {
      code: `
        import React from 'react'
        import useState from 'someOtherUseState'
        const [color, setFlavor] = useState()
      `,
    },
    {
      code: `
        import { useRef } from 'react'
        const result = useState()
      `,
    },
    {
      code: `
        import { useState as useStateAlternativeName } from 'react'
        function useColor() {
          const [color, setColor] = useStateAlternativeName()
          return [color, setColor]
        }
      `,
    },
    {
      code: 'const result = React.useState()',
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          return useState()
        }
      `,
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          function useState() { // shadows React's useState
            return null
          }

          const result = useState()
        }
      `,
    },
    {
      code: `
        import React from 'react'
        function useColor() {
          const React = {
            useState: () => {
              return null
            }
          }

          const result = React.useState()
        }
      `,
    },
    {
      code: `
        import { useState } from 'react';
        function useColor() {
          const [color, setColor] = useState<string>()
          return [color, setColor]
        }
      `,
      features: ['ts', 'no-babel-old'],
    },
    {
      code: `
        import { useState } from 'react';
        function useColor() {
          const [color, setColor] = useState<string>('#ffffff')
          return [color, setColor]
        }
      `,
      features: ['ts'],
    },
  ]),
  invalid: parsers.all([
    {
      code: `
        import { useState } from 'react';
        const result = useState()
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import { useState } from 'react';
        function useColor() {
          const result = useState()
          return result
        }
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import { useState as useStateAlternativeName } from 'react'
        function useColor() {
          const result = useStateAlternativeName()
          return result
        }
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import React from 'react'
        function useColor() {
          const result = React.useState()
          return result
        }
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import ReactAlternative from 'react'
        function useColor() {
          const result = ReactAlternative.useState()
          return result
        }
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const result = useState()
          return result
        }
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [, , extra1] = useState()
        }
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [, setColor] = useState()
        }
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const { color } = useState()
        }
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [] = useState()
        }
      `,
      errors: [{
        message: 'useState call is not destructured into value + setter pair',
      }],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [, , , ,] = useState()
        }
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [color] = useState()
        }
      `,
      errors: [
        {
          message: 'useState call is not destructured into value + setter pair',
          suggestions: [
            {
              output: `
        import { useState } from 'react'
        function useColor() {
          const [color, setColor] = useState()
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor(initialColor) {
          const [color] = useState(initialColor)
        }
      `,
      errors: [
        {
          message: 'useState call is not destructured into value + setter pair',
          suggestions: [
            {
              desc: 'Replace useState call with useMemo',
              output: `
        import { useState, useMemo } from 'react'
        function useColor(initialColor) {
          const color = useMemo(() => initialColor, [])
        }
      `,
            },
            {
              desc: 'Destructure useState call into value + setter pair',
              output: `
        import { useState } from 'react'
        function useColor(initialColor) {
          const [color, setColor] = useState(initialColor)
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import { useState, useMemo as useMemoAlternative } from 'react'
        function useColor(initialColor) {
          const [color] = useState(initialColor)
        }
      `,
      errors: [{
        message: 'useState call is not destructured into value + setter pair',
        suggestions: [
          {
            desc: 'Replace useState call with useMemo',
            output: `
        import { useState, useMemo as useMemoAlternative } from 'react'
        function useColor(initialColor) {
          const color = useMemoAlternative(() => initialColor, [])
        }
      `,
          },
          {
            desc: 'Destructure useState call into value + setter pair',
            output: `
        import { useState, useMemo as useMemoAlternative } from 'react'
        function useColor(initialColor) {
          const [color, setColor] = useState(initialColor)
        }
      `,
          },
        ],
      }],
    },
    {
      code: `
        import React from 'react'
        function useColor(initialColor) {
          const [color] = React.useState(initialColor)
        }
      `,
      errors: [
        {
          message: 'useState call is not destructured into value + setter pair',
          suggestions: [
            {
              desc: 'Replace useState call with useMemo',
              output: `
        import React from 'react'
        function useColor(initialColor) {
          const color = React.useMemo(() => initialColor, [])
        }
      `,
            },
            {
              desc: 'Destructure useState call into value + setter pair',
              output: `
        import React from 'react'
        function useColor(initialColor) {
          const [color, setColor] = React.useState(initialColor)
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [color, , extra1] = useState()
          return [color]
        }
      `,
      errors: [
        {
          message: 'useState call is not destructured into value + setter pair',
          suggestions: [
            {
              output: `
        import { useState } from 'react'
        function useColor() {
          const [color, setColor] = useState()
          return [color]
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [color, setColor, extra1, extra2, extra3] = useState()
          return [color, setColor]
        }
      `,
      errors: [
        {
          message: 'useState call is not destructured into value + setter pair',
          suggestions: [
            {
              output: `
        import { useState } from 'react'
        function useColor() {
          const [color, setColor] = useState()
          return [color, setColor]
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import { useState } from 'react'
        const [, makeColor] = useState()
      `,
      errors: [{ message: 'useState call is not destructured into value + setter pair' }],
    },
    {
      code: `
        import { useState } from 'react'
        const [color, setFlavor, extraneous] = useState()
      `,
      errors: [
        {
          message: 'useState call is not destructured into value + setter pair',
          suggestions: [
            {
              output: `
        import { useState } from 'react'
        const [color, setColor] = useState()
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import { useState } from 'react'
        const [color, setFlavor] = useState()
      `,
      errors: [
        {
          message: 'useState call is not destructured into value + setter pair',
          suggestions: [
            {
              output: `
        import { useState } from 'react'
        const [color, setColor] = useState()
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import { useState } from 'react'
        const [color, setFlavor] = useState<string>()
      `,
      errors: [
        {
          message: 'useState call is not destructured into value + setter pair',
          suggestions: [
            {
              output: `
        import { useState } from 'react'
        const [color, setColor] = useState<string>()
      `,
            },
          ],
        },
      ],
      features: ['ts', 'no-babel-old'],
    },
    {
      code: `
        import { useState } from 'react'
        function useColor() {
          const [color, setFlavor] = useState<string>('#ffffff')
          return [color, setFlavor]
        }
      `,
      errors: [
        {
          message: 'useState call is not destructured into value + setter pair',
          suggestions: [
            {
              output: `
        import { useState } from 'react'
        function useColor() {
          const [color, setColor] = useState<string>('#ffffff')
          return [color, setFlavor]
        }
      `,
            },
          ],
        },
      ],
      features: ['ts', 'no-babel-old'],
    },
    {
      code: `
        import React from 'react'
        function useColor() {
          const [color, setFlavor] = React.useState<string>('#ffffff')
          return [color, setFlavor]
        }
      `,
      errors: [
        {
          message: 'useState call is not destructured into value + setter pair',
          suggestions: [
            {
              output: `
        import React from 'react'
        function useColor() {
          const [color, setColor] = React.useState<string>('#ffffff')
          return [color, setFlavor]
        }
      `,
            },
          ],
        },
      ],
      features: ['ts', 'no-babel-old'],
    },
  ]),
};

ruleTester.run('hook-set-state-names', rule, tests);
