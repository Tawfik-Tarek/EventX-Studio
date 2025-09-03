import { cn } from "@/lib/utils";

const LoadingSpinner = ({
  size = "default",
  variant = "default",
  className = "",
  ...props
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
    "2xl": "w-16 h-16",
  };

  const variantClasses = {
    default: "text-blue-600",
    white: "text-white",
    primary: "text-blue-600",
  };

  return (
    <div
      className={cn("relative", sizeClasses[size], className)}
      {...props}
    >
      <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>

      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 border-t-transparent animate-spin",
          variantClasses[variant]
        )}
        style={{
          borderTopColor: "transparent",
          animation: "spin 1s linear infinite",
        }}
      ></div>

      <div
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full",
          variant === "white" ? "bg-white" : "bg-blue-600",
          size === "sm"
            ? "w-1 h-1"
            : size === "default"
            ? "w-1.5 h-1.5"
            : size === "lg"
            ? "w-2 h-2"
            : size === "xl"
            ? "w-3 h-3"
            : "w-4 h-4"
        )}
      ></div>
    </div>
  );
};

export const PageLoading = ({ text, className = "" }) => (
  <div
    className={cn(
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100",
      className
    )}
  >
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl"></div>
        <div className="relative p-8 rounded-2xl bg-white/60 backdrop-blur-md shadow-xl border border-white/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <LoadingSpinner
                size="2xl"
                className="drop-shadow-lg"
              />
              <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping"></div>
            </div>

            <div className="space-y-2">
              <p className="text-xl font-semibold text-gray-800 tracking-wide">
                {text}
              </p>
              <div className="flex space-x-1 justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ButtonLoading = ({ size = "sm", className = "", ...props }) => (
  <LoadingSpinner
    size={size}
    variant="white"
    className={cn("drop-shadow-sm", className)}
    {...props}
  />
);

export default LoadingSpinner;
