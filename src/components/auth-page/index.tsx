"use client";
import type { AuthPageProps } from "@refinedev/core";
import { AuthPage as AuthPageBase, ThemedLayoutV2, ThemedTitleV2 } from "@refinedev/mui";

export const AuthPage = () => {
  return (
    <AuthPageBase
      //{...props}
      type="login"

      formProps={{
        defaultValues: {
          email: "jimxxx@gmail.com",
          password: "jorge666",
        },
        
      }}
      
      
      
    />
  );
};
