

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."course_type" AS ENUM (
    'JEE',
    'NEET',
    'CUET',
    '11-12',
    '5-10'
);


ALTER TYPE "public"."course_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."course_type" IS 'the type of courses ';



CREATE OR REPLACE FUNCTION "public"."get_course_and_batch_details"("eduport_id" integer) RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
declare
  result json;
begin
  select json_build_object(
    'course', to_jsonb(c),
    'batches', (
      select json_agg(
        json_build_object(
          'id', b.id,
          'name', b.name,
          'type', b.type,
          'amount', b.amount,
          'eduport_batch_id', b.eduport_batch_id,
          'duration', b.duration,
          'discount', b.discount
          
        )
      )
      from batches b
      where b.course_id = c.id
    )
  )
  into result
  from courses c
  where c.eduport_course_id = eduport_id;

  return result;
end;
$$;


ALTER FUNCTION "public"."get_course_and_batch_details"("eduport_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_course_and_batch_details_string"("eduport_id" "text") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$declare
  result json;
begin
  select json_build_object(
    'course', to_jsonb(c),
    'batches', (
      select json_agg(
        json_build_object(
          'id', b.id,
          'name', b.name,
          'type', b.type,
          'amount', b.amount,
          'eduport_batch_id', b.eduport_batch_id,
          'offer_claims', (
            select coalesce(json_agg(
              json_build_object(
                'id', boc.id,
                'created_at', boc.created_at,
                'offer', json_build_object(
                  'id', o.id,
                  'title', o.title,
                  'percentage', o.percentage,
                  'expiry', o.expiry,
                  'is_active', o.is_active,
                  'created_at', o.created_at
                )
              )
            ), '[]'::json)
            from batch_offer_claims boc
            join offers o on boc.offer_id = o.id
            where boc.batch_id = b.id
          )
        )
      )
      from batches b
      where b.course_id = c.id
    )
  )
  into result
  from courses c
  where c.eduport_course_id = eduport_id;

  return result;
end;$$;


ALTER FUNCTION "public"."get_course_and_batch_details_string"("eduport_id" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."access_levels" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text",
    "user_id" "uuid",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."access_levels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."batch_offer_claims" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_id" "uuid",
    "offer_id" "uuid",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."batch_offer_claims" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" character varying(10) NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "eduport_batch_id" bigint,
    "course_id" "uuid",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "discount" smallint DEFAULT '0'::smallint,
    "duration" smallint DEFAULT '0'::smallint,
    CONSTRAINT "batches_type_check" CHECK ((("type")::"text" = ANY (ARRAY[('online'::character varying)::"text", ('offline'::character varying)::"text"])))
);


ALTER TABLE "public"."batches" OWNER TO "postgres";


COMMENT ON COLUMN "public"."batches"."discount" IS '"In %"';



COMMENT ON COLUMN "public"."batches"."duration" IS '"in months"';



CREATE TABLE IF NOT EXISTS "public"."carousel" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "url" "text" NOT NULL,
    "index" integer,
    "course_id" "uuid",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."carousel" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_benefits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "icon_id" "uuid",
    "title" "text" NOT NULL,
    "course_id" "uuid",
    "description" "text",
    "order" integer,
    "color" "text"
);


ALTER TABLE "public"."course_benefits" OWNER TO "postgres";


COMMENT ON COLUMN "public"."course_benefits"."color" IS 'RGB code';



CREATE TABLE IF NOT EXISTS "public"."course_tags" (
    "course_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."course_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "banner_url" "text",
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "sub_heading" "text",
    "description" "text",
    "highlights" "text"[],
    "brochure_url" "text",
    "tag_url" "text",
    "status" character varying(20) DEFAULT 'draft'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "thumbnail" "text",
    "eduport_course_id" bigint,
    "banner_mobile" "text",
    "popular" boolean DEFAULT false NOT NULL,
    "board" "text"[] DEFAULT '{}'::"text"[],
    "course_type" "text",
    CONSTRAINT "courses_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('draft'::character varying)::"text", ('active'::character varying)::"text", ('inactive'::character varying)::"text"])))
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


COMMENT ON COLUMN "public"."courses"."board" IS 'eg: state cbse';



CREATE TABLE IF NOT EXISTS "public"."icons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "url" "text" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."icons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "percentage" numeric(5,2) NOT NULL,
    "expiry" "date" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."offers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users_profile" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "phone_number" "text"
);


ALTER TABLE "public"."users_profile" OWNER TO "postgres";


ALTER TABLE ONLY "public"."access_levels"
    ADD CONSTRAINT "access_levels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."batch_offer_claims"
    ADD CONSTRAINT "batch_offer_claims_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."batches"
    ADD CONSTRAINT "batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carousel"
    ADD CONSTRAINT "carousel_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_benefits"
    ADD CONSTRAINT "course_benefits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_tags"
    ADD CONSTRAINT "course_tags_pkey" PRIMARY KEY ("course_id", "tag_id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."icons"
    ADD CONSTRAINT "icons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."users_profile"
    ADD CONSTRAINT "users_profile_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_batches_course_id" ON "public"."batches" USING "btree" ("course_id");



CREATE INDEX "idx_carousel_course_id" ON "public"."carousel" USING "btree" ("course_id");



CREATE INDEX "idx_course_tags_course" ON "public"."course_tags" USING "btree" ("course_id");



CREATE INDEX "idx_course_tags_tag" ON "public"."course_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_courses_slug" ON "public"."courses" USING "btree" ("slug");



CREATE INDEX "idx_courses_status" ON "public"."courses" USING "btree" ("status");



ALTER TABLE ONLY "public"."access_levels"
    ADD CONSTRAINT "access_levels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."batch_offer_claims"
    ADD CONSTRAINT "batch_offer_claims_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_offer_claims"
    ADD CONSTRAINT "batch_offer_claims_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batches"
    ADD CONSTRAINT "batches_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."carousel"
    ADD CONSTRAINT "carousel_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_benefits"
    ADD CONSTRAINT "course_benefits_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_benefits"
    ADD CONSTRAINT "course_benefits_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "public"."icons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_tags"
    ADD CONSTRAINT "fk_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_tags"
    ADD CONSTRAINT "fk_tag" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users_profile"
    ADD CONSTRAINT "users_profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admin Full access" ON "public"."carousel" USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "Admin full access" ON "public"."batches" USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "Admin full access" ON "public"."course_benefits" USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "Admin full access" ON "public"."courses" USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "Admin full access " ON "public"."icons" USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "Public Read" ON "public"."course_benefits" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile" ON "public"."users_profile" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."users_profile" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own profile" ON "public"."users_profile" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."access_levels" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "all user can view offer claims" ON "public"."batch_offer_claims" FOR SELECT USING (true);



ALTER TABLE "public"."batch_offer_claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carousel" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_benefits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_batch_offer_claims" ON "public"."batch_offer_claims" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "delete_course_tags" ON "public"."course_tags" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "delete_offers" ON "public"."offers" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "delete_tags" ON "public"."tags" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "edit_access_levels_delete" ON "public"."access_levels" FOR DELETE USING ((EXISTS ( WITH "allowed_emails" AS (
         SELECT "unnest"(ARRAY['tech@eduport.app'::"text", 'sunith.eduport@gmail.com'::"text", 'akhil@eduport.app'::"text"]) AS "email"
        )
 SELECT 1
   FROM "allowed_emails"
  WHERE ("allowed_emails"."email" = "auth"."email"()))));



CREATE POLICY "edit_access_levels_update" ON "public"."access_levels" FOR UPDATE USING ((EXISTS ( WITH "allowed_emails" AS (
         SELECT "unnest"(ARRAY['tech@eduport.app'::"text", 'sunith.eduport@gmail.com'::"text", 'akhil@eduport.app'::"text"]) AS "email"
        )
 SELECT 1
   FROM "allowed_emails"
  WHERE ("allowed_emails"."email" = "auth"."email"()))));



CREATE POLICY "edit_batch_offer_claims" ON "public"."batch_offer_claims" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "edit_course_tags" ON "public"."course_tags" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "edit_offers" ON "public"."offers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "edit_tags" ON "public"."tags" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."icons" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_course_tags" ON "public"."course_tags" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



CREATE POLICY "insert_tags" ON "public"."tags" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."access_levels"
  WHERE ("access_levels"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."offers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_read_access" ON "public"."batches" FOR SELECT USING (true);



CREATE POLICY "public_read_access" ON "public"."carousel" FOR SELECT USING (true);



CREATE POLICY "public_read_access" ON "public"."courses" FOR SELECT USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "public_read_access" ON "public"."offers" FOR SELECT USING (true);



CREATE POLICY "public_read_course_tags" ON "public"."course_tags" FOR SELECT USING (true);



CREATE POLICY "public_read_icons" ON "public"."icons" FOR SELECT USING (true);



CREATE POLICY "public_read_tags" ON "public"."tags" FOR SELECT USING (true);



CREATE POLICY "select_access_levels" ON "public"."access_levels" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users_profile" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_course_and_batch_details"("eduport_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_course_and_batch_details"("eduport_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_course_and_batch_details"("eduport_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_course_and_batch_details_string"("eduport_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_course_and_batch_details_string"("eduport_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_course_and_batch_details_string"("eduport_id" "text") TO "service_role";



GRANT ALL ON TABLE "public"."access_levels" TO "anon";
GRANT ALL ON TABLE "public"."access_levels" TO "authenticated";
GRANT ALL ON TABLE "public"."access_levels" TO "service_role";



GRANT ALL ON TABLE "public"."batch_offer_claims" TO "anon";
GRANT ALL ON TABLE "public"."batch_offer_claims" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_offer_claims" TO "service_role";



GRANT ALL ON TABLE "public"."batches" TO "anon";
GRANT ALL ON TABLE "public"."batches" TO "authenticated";
GRANT ALL ON TABLE "public"."batches" TO "service_role";



GRANT ALL ON TABLE "public"."carousel" TO "anon";
GRANT ALL ON TABLE "public"."carousel" TO "authenticated";
GRANT ALL ON TABLE "public"."carousel" TO "service_role";



GRANT ALL ON TABLE "public"."course_benefits" TO "anon";
GRANT ALL ON TABLE "public"."course_benefits" TO "authenticated";
GRANT ALL ON TABLE "public"."course_benefits" TO "service_role";



GRANT ALL ON TABLE "public"."course_tags" TO "anon";
GRANT ALL ON TABLE "public"."course_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."course_tags" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."icons" TO "anon";
GRANT ALL ON TABLE "public"."icons" TO "authenticated";
GRANT ALL ON TABLE "public"."icons" TO "service_role";



GRANT ALL ON TABLE "public"."offers" TO "anon";
GRANT ALL ON TABLE "public"."offers" TO "authenticated";
GRANT ALL ON TABLE "public"."offers" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."users_profile" TO "anon";
GRANT ALL ON TABLE "public"."users_profile" TO "authenticated";
GRANT ALL ON TABLE "public"."users_profile" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
