"""add community messages

Revision ID: 7f8a2d1c4e6b
Revises: aa897d0ab0e2
"""
from alembic import op
import sqlalchemy as sa


revision = "7f8a2d1c4e6b"
down_revision = "aa897d0ab0e2"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "community_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("room_id", sa.String(length=80), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("body", sa.String(length=500), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_community_messages_room_id", "community_messages", ["room_id"])


def downgrade():
    op.drop_index("ix_community_messages_room_id", table_name="community_messages")
    op.drop_table("community_messages")