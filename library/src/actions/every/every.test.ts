import { describe, expect, test } from 'vitest';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { every, type EveryAction, type EveryIssue } from './every.ts';

describe('every', () => {
  describe('should return action object', () => {
    const baseAction: Omit<EveryAction<string[], never>, 'message'> = {
      kind: 'validation',
      type: 'every',
      reference: every,
      expects: null,
      requirement: expect.any(Function),
      async: false,
      _run: expect.any(Function),
    };

    test('with undefined message', () => {
      const action: EveryAction<string[], undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(every(() => true)).toStrictEqual(action);
      expect(every(() => true, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      const message = 'message';
      expect(every(() => true, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies EveryAction<string[], string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(every(() => true, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies EveryAction<string[], typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = every<number[]>((element) => element > 9);

    test('for untyped inputs', () => {
      expect(action._run({ typed: false, value: null }, {})).toStrictEqual({
        typed: false,
        value: null,
      });
    });

    test('for empty array', () => {
      expectNoActionIssue(action, [[]]);
    });

    test('for valid content', () => {
      expectNoActionIssue(action, [[10, 11, 12, 13, 99]]);
    });
  });

  describe('should return an issue', () => {
    const requirement = (element: number) => element > 9;
    const action = every<number[], 'message'>(requirement, 'message');

    const baseIssue: Omit<EveryIssue<number[]>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'every',
      expected: null,
      message: 'message',
      requirement,
    };

    test('for invalid content', () => {
      expectActionIssue(action, baseIssue, [
        [9],
        [1, 2, 3],
        [10, 11, -12, 13, 99],
      ]);
    });
  });
});
