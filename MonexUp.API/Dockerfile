# syntax=docker/dockerfile:1
#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MonexUp.API/MonexUp.API.csproj", "MonexUp.API/"]
COPY ["MonexUp.Application/MonexUp.Application.csproj", "MonexUp.Application/"]
COPY ["MonexUp.Domain/MonexUp.Domain.csproj", "MonexUp.Domain/"]
COPY ["MonexUp.Infra.Interfaces/MonexUp.Infra.Interfaces.csproj", "MonexUp.Infra.Interfaces/"]
COPY ["MonexUp.DTO/MonexUp.DTO.csproj", "MonexUp.DTO/"]
COPY ["MonexUp.Infra/MonexUp.Infra.csproj", "MonexUp.Infra/"]
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore "MonexUp.API/MonexUp.API.csproj"
COPY . .
WORKDIR "/src/MonexUp.API"

FROM build AS publish
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet publish "MonexUp.API.csproj" -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MonexUp.API.dll"]