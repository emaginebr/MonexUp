# Para gerar ou atualizar as tabelas, usa esse comando na pasta.
```
dotnet ef dbcontext scaffold "Server=localhost,1433;Database=GoblinWars;User Id=sa;Password=%SQLSERVER_SA_PASSWORD%;" Microsoft.EntityFrameworkCore.SqlServer --context GoblinWarsContext --output-dir Context -f
```

Após gerar, é necessário comentar a linha: optionsBuilder.UseSqlServer("...") dentro do método OnConfiguring