export interface WelcomeBannerProps {
  userName: string;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-8">
      <h1 className="text-3xl font-bold mb-2">
        Welcome back, {userName}!
      </h1>
      <p className="text-blue-100">
        Here&apos;s what&apos;s happening with your platform today.
      </p>
    </div>
  );
}
