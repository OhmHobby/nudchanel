import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1739007688364 implements MigrationInterface {
  name = 'Migration1739007688364'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "recruit_form_collections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "oid" uuid, "title" text NOT NULL, "recruit_id" uuid NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fe6fe9a3377ad2f46f5a9a920f4" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "recruit_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "oid" uuid, "year" smallint NOT NULL, "name" text NOT NULL, "open_when" TIMESTAMP WITH TIME ZONE NOT NULL, "close_when" TIMESTAMP WITH TIME ZONE NOT NULL, "announce_when" TIMESTAMP WITH TIME ZONE NOT NULL, "maximum_role" smallint NOT NULL DEFAULT '1', "is_active" boolean NOT NULL DEFAULT false, "survey_collection_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_48b9fcc7f033c2c86960e9d4eb1" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "recruit_applicants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "oid" uuid, "profileId" uuid NOT NULL, "recruit_id" uuid NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_317192bbdbf05a838d856f7534d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "recruit_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "oid" uuid, "name" text NOT NULL, "description" text NOT NULL, "rank" smallint NOT NULL DEFAULT '0', "mandatory" boolean NOT NULL, "recruit_id" uuid NOT NULL, "collection_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6e63df8c272eb70d14b1b802a0a" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "recruit_applicant_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rank" smallint NOT NULL DEFAULT '0', "applicant_id" uuid NOT NULL, "role_id" uuid NOT NULL, "offer_response_at" TIMESTAMP WITH TIME ZONE, "offerAccepted" boolean NOT NULL DEFAULT false, "offer_expire_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cf070193c8ef56ec9cecfea4367" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "recruit_form_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "oid" uuid, "collection_id" uuid NOT NULL, "question" text NOT NULL, "input" text NOT NULL, "options" jsonb, "rank" smallint NOT NULL DEFAULT '0', "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b0ea8fa5412a8a669514e7dcfc0" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "recruit_form_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "oid" uuid, "answer" text NOT NULL, "applicant_id" uuid NOT NULL, "question_id" uuid NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_548be22adcc3731b63253198d2b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "recruit_interview_slots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "oid" uuid, "start_when" TIMESTAMP WITH TIME ZONE NOT NULL, "end_when" TIMESTAMP WITH TIME ZONE NOT NULL, "interview_at" TIMESTAMP WITH TIME ZONE, "role_id" uuid NOT NULL, "applicant_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b45840e5c7e179a6f39f4f17440" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "recruit_notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "oid" uuid, "note" text NOT NULL, "only_me" boolean NOT NULL DEFAULT false, "applicant_id" uuid NOT NULL, "created_by" uuid NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5a17b96c5ee9b481784bb0b51ef" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "recruit_role_moderators" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_03ba675f8d2ffcd91671ec16453" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_form_collections" ADD CONSTRAINT "FK_84fe3af67572919d792b581e6f5" FOREIGN KEY ("recruit_id") REFERENCES "recruit_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_settings" ADD CONSTRAINT "FK_906eae4877853ad9d7cf2f6c478" FOREIGN KEY ("survey_collection_id") REFERENCES "recruit_form_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_applicants" ADD CONSTRAINT "FK_bf4116e0e374e7ad0d1f5eaffd7" FOREIGN KEY ("recruit_id") REFERENCES "recruit_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_roles" ADD CONSTRAINT "FK_4005afb4f13eade2809e0b70150" FOREIGN KEY ("recruit_id") REFERENCES "recruit_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_roles" ADD CONSTRAINT "FK_49547e8cc47a6bb108489fbab23" FOREIGN KEY ("collection_id") REFERENCES "recruit_form_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_applicant_roles" ADD CONSTRAINT "FK_127c2079286ae6a959113f25704" FOREIGN KEY ("applicant_id") REFERENCES "recruit_applicants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_applicant_roles" ADD CONSTRAINT "FK_72f74b00ac69d44523b2d5cf52c" FOREIGN KEY ("role_id") REFERENCES "recruit_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_form_questions" ADD CONSTRAINT "FK_cf1408dc2d73739725623b90a40" FOREIGN KEY ("collection_id") REFERENCES "recruit_form_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_form_answers" ADD CONSTRAINT "FK_e08ac1f8306a7282b625e389cce" FOREIGN KEY ("applicant_id") REFERENCES "recruit_applicants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_form_answers" ADD CONSTRAINT "FK_654a9156892f2c6bad555ca807d" FOREIGN KEY ("question_id") REFERENCES "recruit_form_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_interview_slots" ADD CONSTRAINT "FK_374a32c1360abc07fa4aba5ea95" FOREIGN KEY ("role_id") REFERENCES "recruit_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_interview_slots" ADD CONSTRAINT "FK_48a6d6f19e74615ca77ec5734d5" FOREIGN KEY ("applicant_id") REFERENCES "recruit_applicants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_notes" ADD CONSTRAINT "FK_ac4744d913fe0e783bf858b29fc" FOREIGN KEY ("applicant_id") REFERENCES "recruit_applicants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_role_moderators" ADD CONSTRAINT "FK_86408c88780a31a7c79f6b3fb05" FOREIGN KEY ("role_id") REFERENCES "recruit_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_role_moderators" DROP CONSTRAINT "FK_86408c88780a31a7c79f6b3fb05"`)
    await queryRunner.query(`ALTER TABLE "recruit_notes" DROP CONSTRAINT "FK_ac4744d913fe0e783bf858b29fc"`)
    await queryRunner.query(`ALTER TABLE "recruit_interview_slots" DROP CONSTRAINT "FK_48a6d6f19e74615ca77ec5734d5"`)
    await queryRunner.query(`ALTER TABLE "recruit_interview_slots" DROP CONSTRAINT "FK_374a32c1360abc07fa4aba5ea95"`)
    await queryRunner.query(`ALTER TABLE "recruit_form_answers" DROP CONSTRAINT "FK_654a9156892f2c6bad555ca807d"`)
    await queryRunner.query(`ALTER TABLE "recruit_form_answers" DROP CONSTRAINT "FK_e08ac1f8306a7282b625e389cce"`)
    await queryRunner.query(`ALTER TABLE "recruit_form_questions" DROP CONSTRAINT "FK_cf1408dc2d73739725623b90a40"`)
    await queryRunner.query(`ALTER TABLE "recruit_applicant_roles" DROP CONSTRAINT "FK_72f74b00ac69d44523b2d5cf52c"`)
    await queryRunner.query(`ALTER TABLE "recruit_applicant_roles" DROP CONSTRAINT "FK_127c2079286ae6a959113f25704"`)
    await queryRunner.query(`ALTER TABLE "recruit_roles" DROP CONSTRAINT "FK_49547e8cc47a6bb108489fbab23"`)
    await queryRunner.query(`ALTER TABLE "recruit_roles" DROP CONSTRAINT "FK_4005afb4f13eade2809e0b70150"`)
    await queryRunner.query(`ALTER TABLE "recruit_applicants" DROP CONSTRAINT "FK_bf4116e0e374e7ad0d1f5eaffd7"`)
    await queryRunner.query(`ALTER TABLE "recruit_settings" DROP CONSTRAINT "FK_906eae4877853ad9d7cf2f6c478"`)
    await queryRunner.query(`ALTER TABLE "recruit_form_collections" DROP CONSTRAINT "FK_84fe3af67572919d792b581e6f5"`)
    await queryRunner.query(`DROP TABLE "recruit_role_moderators"`)
    await queryRunner.query(`DROP TABLE "recruit_notes"`)
    await queryRunner.query(`DROP TABLE "recruit_interview_slots"`)
    await queryRunner.query(`DROP TABLE "recruit_form_answers"`)
    await queryRunner.query(`DROP TABLE "recruit_form_questions"`)
    await queryRunner.query(`DROP TABLE "recruit_applicant_roles"`)
    await queryRunner.query(`DROP TABLE "recruit_roles"`)
    await queryRunner.query(`DROP TABLE "recruit_applicants"`)
    await queryRunner.query(`DROP TABLE "recruit_settings"`)
    await queryRunner.query(`DROP TABLE "recruit_form_collections"`)
  }
}
