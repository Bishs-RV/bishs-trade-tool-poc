CREATE SCHEMA IF NOT EXISTS trade_tool;

CREATE ROLE trade_tool_reader WITH
  NOLOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

CREATE ROLE trade_tool_writer WITH
  NOLOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

GRANT trade_tool_reader TO trade_tool_writer;

CREATE ROLE trade_tool_creator WITH
  NOLOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

GRANT trade_tool_writer TO trade_tool_creator;

GRANT USAGE ON SCHEMA trade_tool TO trade_tool_reader;
GRANT USAGE ON SCHEMA trade_tool TO trade_tool_writer;
GRANT SELECT ON ALL TABLES IN SCHEMA trade_tool TO trade_tool_reader;
GRANT ALL ON ALL TABLES IN SCHEMA trade_tool TO trade_tool_writer;
GRANT ALL ON ALL SEQUENCES IN SCHEMA trade_tool TO trade_tool_writer;
GRANT ALL ON SCHEMA trade_tool TO "BishsRV";
GRANT CREATE ON SCHEMA trade_tool TO trade_tool_creator;

SET ROLE trade_tool_creator;

ALTER DEFAULT PRIVILEGES FOR ROLE trade_tool_creator IN SCHEMA trade_tool
GRANT SELECT ON TABLES TO trade_tool_reader;

ALTER DEFAULT PRIVILEGES FOR ROLE trade_tool_creator IN SCHEMA trade_tool
GRANT ALL ON TABLES TO trade_tool_writer;

ALTER DEFAULT PRIVILEGES FOR ROLE trade_tool_creator IN SCHEMA trade_tool
GRANT ALL ON SEQUENCES TO trade_tool_writer;

SET ROLE "BishsRV";

ALTER DEFAULT PRIVILEGES FOR ROLE "BishsRV" IN SCHEMA trade_tool
GRANT SELECT ON TABLES TO trade_tool_reader;

ALTER DEFAULT PRIVILEGES FOR ROLE "BishsRV" IN SCHEMA trade_tool
GRANT ALL ON TABLES TO trade_tool_writer;

ALTER DEFAULT PRIVILEGES FOR ROLE "BishsRV" IN SCHEMA trade_tool
GRANT ALL ON SEQUENCES TO trade_tool_writer;
