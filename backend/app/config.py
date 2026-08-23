from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 30

    cors_origins: str = "http://localhost:3000,http://localhost:8000"

    # WDK real (@tetherto/wdk-cli, Sepolia testnet) -- ver backend/wdk_bridge/.
    # Sin estas variables, los payouts fallan con un error claro en vez de
    # fingir una transaccion (a diferencia de Kapso/GenLayer, que siguen
    # simulados a proposito).
    wdk_wallet_name: str = ""
    wdk_passphrase: str = ""
    wdk_network: str = "sepolia"
    wdk_token: str = "musdt"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
