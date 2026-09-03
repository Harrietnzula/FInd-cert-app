"""allow stored profile image data

Revision ID: 2c91e4b7a630
Revises: 7f8a2d1c4e6b
"""
from alembic import op
import sqlalchemy as sa


revision = "2c91e4b7a630"
down_revision = "7f8a2d1c4e6b"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column(
            "avatar_url",
            existing_type=sa.String(length=500),
            type_=sa.Text(),
            existing_nullable=True,
        )


def downgrade():
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column(
            "avatar_url",
            existing_type=sa.Text(),
            type_=sa.String(length=500),
            existing_nullable=True,
        )