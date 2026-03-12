const RouteLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">
          Checking your session...
        </p>
      </div>
    </div>
  );
};

export default RouteLoadingScreen;
