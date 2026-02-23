#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
ENV ASPNETCORE_ENVIRONMENT=Docker
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MonexUp.BackgroundService/MonexUp.BackgroundService.csproj", "MonexUp.BackgroundService/"]
COPY ["MonexUp.Application/MonexUp.Application.csproj", "MonexUp.Application/"]
COPY ["MonexUp.Domain/MonexUp.Domain.csproj", "MonexUp.Domain/"]
COPY ["MonexUp.Infra.Interfaces/MonexUp.Infra.Interfaces.csproj", "MonexUp.Infra.Interfaces/"]
COPY ["MonexUp.DTO/MonexUp.DTO.csproj", "MonexUp.DTO/"]
COPY ["MonexUp.Infra/MonexUp.Infra.csproj", "MonexUp.Infra/"]
RUN dotnet restore "MonexUp.BackgroundService/MonexUp.BackgroundService.csproj"
COPY . .
WORKDIR "/src/MonexUp.BackgroundService"
RUN dotnet build "MonexUp.BackgroundService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MonexUp.BackgroundService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MonexUp.BackgroundService.dll"]
