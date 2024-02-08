import { useEffect, useState } from "react";

import { resolveHookState } from "../../logic/resolveHookState.ts";
import type {
  UsePermissionDescriptor,
  UsePermissionReturn,
} from "../../types/effects.ts";
import type { HookStateInitAction } from "../../types/logic.ts";
import { hasNavigator } from "../../utils/hasNavigator.ts";
import { isFunction } from "../../utils/isFunction.ts";
import { noop } from "../../utils/noop.ts";
import { off } from "../../utils/off.ts";
import { on } from "../../utils/on.ts";
import { warn } from "../../utils/warn.ts";

/**
 * Checks if the `navigator.permissions` API is supported.
 *
 * @returns `true` if the `navigator.permissions` API is supported, `false` otherwise
 */
const isPermissionsApiSupported = (): boolean => {
  try {
    return hasNavigator && isFunction(navigator.permissions.query);
  } catch {
    return false;
  }
};

/**
 * React side-effect hook to query permission status of browser APIs.
 *
 * @example
 * ```tsx
 * const permissionState = usePermission({ name: "camera" });
 *
 * return (
 *   <pre>
 *     {JSON.stringify(permissionState, null, 2)}
 *   </pre>
 * );
 * ```
 *
 * @param permissionDesc The permission descriptor
 * @returns The permission state (`"granted"` | `"denied"` | `"prompt"` | `""`)
 *
 * @category Effect
 * @since 0.0.1
 */
export const usePermission = isPermissionsApiSupported()
  ? (
      descriptor: HookStateInitAction<UsePermissionDescriptor>
    ): UsePermissionReturn => {
      const descriptorState = resolveHookState(descriptor);

      const [state, setState] = useState<UsePermissionReturn>(null);

      useEffect(() => {
        let mounted = true;
        let permissionStatus: PermissionStatus | null = null;

        const onChange = () => {
          if (mounted) {
            setState(() => permissionStatus?.state ?? null);
          }
        };

        navigator.permissions
          .query(descriptorState as PermissionDescriptor)
          .then(status => {
            permissionStatus = status;
            on(permissionStatus, "change", onChange);
            onChange();
          })
          .catch(noop);

        return () => {
          mounted = false;
          if (permissionStatus) {
            off(permissionStatus, "change", onChange);
            permissionStatus = null;
          }
        };
      }, [descriptorState]);

      return state;
    }
  : (
      descriptor: HookStateInitAction<UsePermissionDescriptor>
    ): UsePermissionReturn => {
      warn(
        "The `usePermission` hook should be used in a `navigator` environment.",
        { descriptor }
      );

      return null;
    };
